import React from 'react';

const FormError: React.FC<{
  errors: Record<string, { title: string; message: string }>;
}> = ({ errors }) => {
  return (
    <>
      {Object.keys(errors).map((key) => (
        <div
          key={key}
          className="w-full mt-5 bg-[#F3F5F6] dark:bg-[#292A33] border border-black/10 dark:border-white/25 shadow-row-dark py-3 px-5 space-y-1 rounded-lg backdrop-blur-[20px]"
        >
          <div className="flex items-start space-x-2.5">
            <div className="flex-grow">
              <p className="text-[12px] leading-[1.67] font-bold !text-[#F04A44]">
                {errors[key].title}
              </p>
              {errors[key].message ? (
                <p className="text-[12px] leading-[1.17] font-medium dark:text-white/50 text-black/50">
                  {errors[key].message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FormError;
