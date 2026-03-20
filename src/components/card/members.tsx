"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { User } from "@prisma/client";

export function MembersSection({
  members,
}: {
  members: { user: Pick<User, "id" | "name" | "avatar"> }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {members.map(({ user }) => (
        <div key={user.id} className="flex items-center gap-1.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-secondary">{user.name}</span>
        </div>
      ))}
    </div>
  );
}
