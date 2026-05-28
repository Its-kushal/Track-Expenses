"use client";
import { useState } from "react";
import Link from "next/link";
import AddMemberModal from "@/components/forms/AddMemberModal";
import SettleUpModal from "@/components/forms/SettleUpModal";

type PaymentMode = { id: string; name: string };

export default function GroupHeaderActions({
    groupId,
    members,
    paymentModes,
}: {
    groupId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members: any[];
    paymentModes: PaymentMode[];
}) {
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

    return (
        <>
            <div className="flex gap-3 mt-4 md:mt-0 flex-wrap">
                <button
                    onClick={() => setIsMemberModalOpen(true)}
                    className="bg-white/10 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-white/20 transition text-sm"
                >
                    + Invite
                </button>
                <button
                    onClick={() => setIsSettleModalOpen(true)}
                    className="bg-green-500/10 text-green-400 border border-green-500/20 px-5 py-2.5 rounded-xl font-semibold hover:bg-green-500/20 transition text-sm"
                >
                    Settle Up
                </button>
                <Link
                    href={`/groups/${groupId}/expenses/new`}
                    className="bg-white text-black px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition text-sm"
                >
                    + Add Expense
                </Link>
            </div>

            {isMemberModalOpen && (
                <AddMemberModal
                    groupId={groupId}
                    onClose={() => setIsMemberModalOpen(false)}
                />
            )}

            {/* 2. Pass paymentModes down to the SettleUpModal */}
            {isSettleModalOpen && (
                <SettleUpModal
                    groupId={groupId}
                    members={members}
                    paymentModes={paymentModes}
                    onClose={() => setIsSettleModalOpen(false)}
                />
            )}
        </>
    );
}
