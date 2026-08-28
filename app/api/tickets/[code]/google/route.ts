import { NextResponse } from "next/server";
import { buildGoogleSaveUrl, getOwnTicket, googleWalletReady } from "@/lib/wallet";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const result = await getOwnTicket(code);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (!googleWalletReady()) {
    return NextResponse.json(
      {
        error:
          "Google Wallet is not connected yet. Add your issuer ID and service account JSON to .env.",
      },
      { status: 501 }
    );
  }

  try {
    return NextResponse.redirect(buildGoogleSaveUrl(result.order));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not build Google Wallet pass." },
      { status: 500 }
    );
  }
}
