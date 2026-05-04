import { Composition } from "remotion";
import { BrandIntro } from "./compositions/BrandIntro";
import { BrandOutro } from "./compositions/BrandOutro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BrandIntro"
        // @ts-expect-error Composition types are too strict for typed component props
        component={BrandIntro}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          brandName: "CR3SCE",
          tagline: "Conteúdo que cresce",
        }}
      />
      <Composition
        id="BrandOutro"
        // @ts-expect-error Composition types are too strict for typed component props
        component={BrandOutro}
        durationInFrames={75}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          brandName: "CR3SCE",
          tagline: "Siga @cr3sce",
        }}
      />
    </>
  );
};
