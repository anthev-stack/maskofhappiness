import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/account-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login?callbackUrl=/account");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <AccountForm name={user.name} email={user.email} />
    </div>
  );
}
