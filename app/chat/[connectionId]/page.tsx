import { redirect } from "next/navigation";

export default async function ChatPage({ params }: { params: Promise<{ connectionId: string }> }) {
  const { connectionId } = await params;
  redirect(`/messages?thread=${connectionId}`);
}
