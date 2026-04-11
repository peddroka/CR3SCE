import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VideoEditorClient } from "@/components/dashboard/video-editor-client";

export default async function VideoEditorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <VideoEditorClient
      userId={user.id}
      businessName={business?.business_name || "sua marca"}
    />
  );
}
