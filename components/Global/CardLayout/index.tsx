import React from "react";

type Props = {
  children: React.ReactNode;
  buttonChildren?: React.ReactNode;
  heading: string;
  subHeading: string;
  layoutId: string;
  childrenClassName?: string;
  HeadingIcon?: React.ReactNode;
};

const CardLayout = ({
  children,
  heading,
  subHeading,
  buttonChildren,
  layoutId,
  childrenClassName,
  HeadingIcon,
}: Props) => {

  return (
    <div
      className="w-full h-full flex flex-col gap-y-4 pb-5 rounded-xl border border-input"
      id={layoutId}
    >
      {/* Header */}
      <div className="w-full px-6 py-5 flex flex-wrap justify-between items-center gap-2 border-b bg-secondary border-input rounded-t-xl">
        <div className="md:max-w-xl">
          <div className="flex items-center justify-start gap-2">
            <h4 className="text-lg font-semibold">{heading}</h4>
            {
              HeadingIcon
            }
          </div>

          <p className="text-sm font-normal mt-2 text-muted-foreground">
            {subHeading}
          </p>
        </div>
        {buttonChildren}
      </div>
      <div className={`w-full h-full ${childrenClassName}`}>{children}</div>
    </div>
  );
};

export default CardLayout;
