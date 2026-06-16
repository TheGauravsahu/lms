import { purchaseApi } from "@/api/purchaseApi";
import PurchaseModel from "@/components/purchase/purchase-model";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/formatDate";
import { Sparkle } from "lucide-react";
import { useLocation } from "react-router";
// import { useState } from "react";

const CourseBanner = ({ data }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { data: isPurchased } = purchaseApi.useCheckPurchase(data.overview._id);

  //   const banners = ["/course_banner_bg_v2.png", "/course_banner_bg.png"];
  //   const [bannerSrc] = useState(() => {
  //     return banners[Math.floor(Math.random() * banners.length)];
  //   });

  return (
    <div className="relative h-52 w-full border rounded-lg my-4">
      <div className="rounded-lg overflow-hidden h-52 w-full flex items-center justify-center bg-gradient-to-t from-primary/40 to-primary">
        {/* <img
          src={bannerSrc}
          alt="banner"
          className="w-full h-full object-cover"
        /> */}
      </div>

      <div className="absolute top-0 left-0 text-white p-8 flex justify-between w-full">
        <div>
          <h2 className="font-semibold text-4xl">{data.overview.title}</h2>
          <h3 className="text-sm mt-3">
            Created: {formatDate(data.overview.createdAt)}
          </h3>
          {isAdmin && (
            <h3 className="text-sm">Status: {data.overview.status}</h3>
          )}

          <div className="flex mt-3">
            <h2 className="font-semibold text-4xl">
              ₹{data.overview.offer_price}
            </h2>
            <h2 className="font-semibold text-3xl line-through ml-4">
              {data.overview.original_price}
            </h2>
          </div>

          {!isAdmin && (
            <>
              {isPurchased ? (
                <div
                  className={`${buttonVariants({ variant: "ghost" })} text-orange-600 bg-orange-100 hover:bg-orange-100 hover:text-orange-600 rounded-sm w-full my-2 cursor-pointer`}
                >
                  <Sparkle />
                  Purchased
                </div>
              ) : (
                <PurchaseModel course={data.overview} />
              )}
            </>
          )}
        </div>

        <div className="">
          <img
            src={data.overview.thumbnail.url}
            alt={data.overview.title}
            className="rounded-lg h-42 pb-4 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default CourseBanner;
