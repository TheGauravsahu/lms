import { purchaseApi } from "@/api/purchaseApi";
import LoginModal from "@/components/auth/login-modal";
import PurchaseModel from "@/components/purchase/purchase-model";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/formatDate";
import { useAuthStore } from "@/store/auth";
import { ArrowRight } from "lucide-react";
import { Sparkle } from "lucide-react";
import { useLocation } from "react-router";
// import { useState } from "react";

const CourseBanner = ({ data }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const user = useAuthStore((state) => state.user);
  const { data: isPurchased } = purchaseApi.useCheckPurchase(data.overview._id);

  return (
    <div className="relative min-h-[13rem] w-full border rounded-lg my-4 bg-gradient-to-t from-primary/40 to-primary text-white p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 overflow-hidden">
      {/* Decorative background overlay */}
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <h2 className="font-semibold text-2xl md:text-4xl leading-tight">{data.overview.title}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm opacity-90">
            <h3>Created: {formatDate(data.overview.createdAt)}</h3>
            {isAdmin && <h3>Status: {data.overview.status}</h3>}
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="font-bold text-3xl md:text-4xl">₹{data.overview.offer_price}</h2>
            <h2 className="font-semibold text-xl md:text-2xl line-through opacity-70">{data.overview.original_price}</h2>
          </div>

          <div className="w-full sm:w-fit min-w-[12rem] mt-3">
            {!user ? (
              <LoginModal>
                <Button
                  variant="secondary"
                  className="w-full cursor-pointer text-orange-600 bg-orange-100 hover:bg-orange-200"
                >
                  Buy Now <ArrowRight />
                </Button>
              </LoginModal>
            ) : (
              !isAdmin && (
                <>
                  {isPurchased ? (
                    <div
                      className={`${buttonVariants({ variant: "ghost" })} text-orange-600 bg-orange-100 hover:bg-orange-200 hover:text-orange-600 rounded-sm w-full cursor-pointer`}
                    >
                      <Sparkle />
                      Purchased
                    </div>
                  ) : (
                    <PurchaseModel course={data.overview} />
                  )}
                </>
              )
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 shrink-0 self-center md:self-end">
        <img
          src={data.overview.thumbnail.url}
          alt={data.overview.title}
          className="rounded-lg h-32 md:h-40 w-auto object-cover shadow-md"
        />
      </div>
    </div>
  );
};

export default CourseBanner;
