// import Images & Icons
import LoaderIcon from "@/assets/icons/loader.svg";

export const Loader = () => {
  return (
    <div className="flex-center w-full">
      <img src={LoaderIcon} alt="loader" width={24} height={24} />
    </div>
  );
};
