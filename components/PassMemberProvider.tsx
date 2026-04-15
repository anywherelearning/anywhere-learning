'use client';

import { PassMemberContext, usePassMemberStatus } from '@/hooks/usePassMember';

export default function PassMemberProvider({ children }: { children: React.ReactNode }) {
  const status = usePassMemberStatus();
  return (
    <PassMemberContext.Provider value={status}>
      {children}
    </PassMemberContext.Provider>
  );
}
