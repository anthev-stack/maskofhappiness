import { createSign } from "crypto";
import { PKPass } from "passkit-generator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ticketPayload } from "@/lib/ticket";
import { formatEventDate } from "@/lib/utils";

const ICON_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
  "base64"
);

export async function getOwnTicket(code: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Sign in to add this ticket.", status: 401 as const };
  }

  const order = await prisma.order.findUnique({
    where: { ticketCode: code.toUpperCase() },
    include: { event: true, user: true },
  });

  if (!order || order.userId !== session.user.id) {
    return { error: "Ticket not found.", status: 404 as const };
  }

  return { order };
}

function pemFromEnv(value?: string) {
  if (!value) return "";
  return value.includes("BEGIN") ? value.replace(/\\n/g, "\n") : Buffer.from(value, "base64").toString("utf8");
}

export function appleWalletReady() {
  return Boolean(
    process.env.APPLE_PASS_TYPE_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_SIGNER_CERT &&
      process.env.APPLE_SIGNER_KEY &&
      process.env.APPLE_WWDR_CERT
  );
}

export function googleWalletReady() {
  return Boolean(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SA_JSON);
}

export async function buildApplePass(order: {
  ticketCode: string;
  user: { name: string };
  event: { title: string; location: string; startsAt: Date };
}) {
  const pass = new PKPass(
    {
      "icon.png": ICON_PNG,
      "icon@2x.png": ICON_PNG,
      "logo.png": ICON_PNG,
      "logo@2x.png": ICON_PNG,
    },
    {
      wwdr: pemFromEnv(process.env.APPLE_WWDR_CERT),
      signerCert: pemFromEnv(process.env.APPLE_SIGNER_CERT),
      signerKey: pemFromEnv(process.env.APPLE_SIGNER_KEY),
      signerKeyPassphrase: process.env.APPLE_SIGNER_KEY_PASSPHRASE || undefined,
    },
    {
      serialNumber: order.ticketCode,
      description: order.event.title,
      organizationName: "maskofhappiness",
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
      teamIdentifier: process.env.APPLE_TEAM_ID,
      foregroundColor: "rgb(236, 249, 251)",
      backgroundColor: "rgb(8, 8, 8)",
      labelColor: "rgb(225, 29, 72)",
    }
  );

  pass.type = "eventTicket";
  pass.setBarcodes({
    message: ticketPayload(order.ticketCode),
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
    altText: order.ticketCode,
  });
  pass.primaryFields.push({
    key: "event",
    label: "EVENT",
    value: order.event.title,
  });
  pass.secondaryFields.push({
    key: "when",
    label: "WHEN",
    value: formatEventDate(order.event.startsAt),
  });
  pass.auxiliaryFields.push(
    { key: "where", label: "WHERE", value: order.event.location },
    { key: "guest", label: "GUEST", value: order.user.name }
  );

  return pass.getAsBuffer();
}

function signRs256(payload: object, privateKey: string) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsigned = `${header}.${body}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  return `${unsigned}.${signer.sign(privateKey, "base64url")}`;
}

export function buildGoogleSaveUrl(order: {
  ticketCode: string;
  event: { id: string; title: string; location: string; startsAt: Date; endsAt: Date | null };
  user: { name: string };
}) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;
  const sa = JSON.parse(process.env.GOOGLE_WALLET_SA_JSON!) as {
    client_email: string;
    private_key: string;
  };
  const classId = `${issuerId}.moh_event_${order.event.id.replace(/[^a-zA-Z0-9._]/g, "")}`;
  const objectId = `${issuerId}.moh_${order.ticketCode}`;
  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const claims = {
    iss: sa.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [origin],
    payload: {
      eventTicketClasses: [
        {
          id: classId,
          issuerName: "maskofhappiness",
          reviewStatus: "UNDER_REVIEW",
          eventName: { defaultValue: { language: "en-AU", value: order.event.title } },
          venue: {
            name: { defaultValue: { language: "en-AU", value: order.event.location } },
            address: { defaultValue: { language: "en-AU", value: order.event.location } },
          },
          dateTime: {
            start: order.event.startsAt.toISOString(),
            end: (order.event.endsAt ?? order.event.startsAt).toISOString(),
          },
        },
      ],
      eventTicketObjects: [
        {
          id: objectId,
          classId,
          state: "ACTIVE",
          ticketHolderName: order.user.name,
          ticketNumber: order.ticketCode,
          barcode: {
            type: "QR_CODE",
            value: ticketPayload(order.ticketCode),
            alternateText: order.ticketCode,
          },
        },
      ],
    },
  };

  return `https://pay.google.com/gp/v/save/${signRs256(claims, sa.private_key)}`;
}
