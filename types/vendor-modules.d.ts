declare module "lucide-react/dist/esm/icons/*" {
  import * as React from "react";

  const Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default Icon;
}

declare module "@radix-ui/react-slider" {
  import * as React from "react";

  export const Root: React.ComponentType<any>;
  export const Track: React.ComponentType<any>;
  export const Range: React.ComponentType<any>;
  export const Thumb: React.ComponentType<any>;
}
