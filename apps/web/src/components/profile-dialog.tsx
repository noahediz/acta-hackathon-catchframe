import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileDialog({ isOpen, onClose }: AboutDialogProps) {
    const {data: session} = useSession();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] gap-6">
        <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
                Information about your profile. No personal information are stored.
            </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4">
            <Avatar className="size-12">
            <AvatarImage src={session?.user?.image || "/placeholder.svg"} alt={session?.user?.name || ''} />
            <AvatarFallback>
                {session?.user?.name || ''
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
        </div>
        <Separator />
        <div className="space-y-2">
              <h3 className="text-sm font-medium">Session Details</h3>
              {session && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Session expires: {new Date(session.expires).toDateString()} at {new Date(session.expires).toLocaleTimeString()}
                  </p>
                </div>
              )}
        </div>
      </DialogContent>
    </Dialog>
  )
}