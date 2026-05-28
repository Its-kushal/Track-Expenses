"use client";
import { useTransition } from "react";
import { confirmSettlement } from "@/features/settlements/confirmSettlement";

export default function ConfirmSettlementButton({
    settlementId,
}: {
    settlementId: string;
}) {
    const [isPending, startTransition] = useTransition();

    function handleConfirm() {
        startTransition(async () => {
            const result = await confirmSettlement(settlementId);
            if (result.error) alert(result.error);
        });
    }

    return (
        <button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
        >
            {isPending ? "Confirming..." : "Confirm Receipt"}
        </button>
    );
}
