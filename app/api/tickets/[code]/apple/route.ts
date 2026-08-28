import { NextResponse } from "next/server";
import { appleWalletReady, buildApplePass, getOwnTicket } from "@/lib/wallet";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const result = await getOwnTicket(code);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (!appleWalletReady()) {
    return NextResponse.json(
      {
        error:
          "Apple Wallet is not connected yet. Add your Pass Type ID, Team ID, and signing certificates to .env.",
      },
      { status: 501 }
    );
  }

  try {
    const buffer = await buildApplePass(result.order);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="maskofhappiness-${result.order.ticketCode}.pkpass"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not build Apple Wallet pass." },
      { status: 500 }
    );
  }
}
