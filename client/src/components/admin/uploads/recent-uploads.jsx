import { uploadApi } from "@/api/uploadApi";
import { useState } from "react";

const RecentUploads = ({ onChange }) => {
  const { data, isPending } = uploadApi.useRecentUploads();
  const [selected, setSelected] = useState();

  return (
    <div className="w-full h-full">
      <h1 className="font-semibold text-xl">Recent Uploads</h1>
      <p className="text-sm text-muted-foreground my-1">
        You can select recent uplaoded thumbnails
      </p>
      {isPending ? (
        <div className="flex flex-row flex-wrap gap-4 mt-8">
          {[1, 2, 3, 4, 5, 6].map((f) => (
            <div
              key={f}
              className="bg-secondary h-32 w-48 overflow-hidden rounded-lg border"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-row flex-wrap gap-4 mt-8">
          {data.map((f) => (
            <div
              key={f.size}
              className="bg-secondary h-28 w-52 overflow-hidden rounded-lg border cursor-pointer relative"
            >
              <div
                className={
                  selected === f._id &&
                  "border border-dashed inset-0 border-green-400 bg-black/60 absolute p-2 w-full h-full flex items-center justify-center"
                }
              >
                {selected === f._id && (
                  <span className="text-green-400 font-semibold">Selected</span>
                )}
              </div>

              <img
                onClick={() => {
                  setSelected(f._id);
                  onChange(f._id);
                }}
                src={f.url}
                alt={f.name}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentUploads;
