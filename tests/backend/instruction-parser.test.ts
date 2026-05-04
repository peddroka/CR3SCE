import { describe, expect, it } from "vitest";
import {
  parseInstruction,
  mergeOperations,
} from "@/lib/instruction-parser";
import type { VideoOperation } from "@/lib/video-editor";

describe("parseInstruction", () => {
  describe("captions", () => {
    it("detects 'legenda' and adds transcribe + burn_subtitles", () => {
      const { operations } = parseInstruction(
        "adicione legendas automáticas",
        false,
      );
      const types = operations.map((o) => o.type);
      expect(types).toContain("transcribe");
      expect(types).toContain("burn_subtitles");
    });

    it("detects English 'subtitle'", () => {
      const { operations } = parseInstruction("add subtitles please", false);
      expect(operations.map((o) => o.type)).toContain("transcribe");
    });
  });

  describe("trim", () => {
    it("parses 'cortar de Xs até Ys'", () => {
      const { operations } = parseInstruction("cortar de 5s até 30s", false);
      const trim = operations.find((o) => o.type === "trim");
      expect(trim).toMatchObject({
        type: "trim",
        startSecond: 5,
        endSecond: 30,
      });
    });

    it("parses 'cortar até X segundos' without start", () => {
      const { operations } = parseInstruction(
        "cortar até 15 segundos",
        false,
      );
      const trim = operations.find((o) => o.type === "trim");
      expect(trim?.startSecond).toBe(0);
      expect(trim?.endSecond).toBe(15);
    });

    it("ignores invalid trim where end <= start", () => {
      const { operations } = parseInstruction("cortar de 30 até 5", false);
      expect(operations.find((o) => o.type === "trim")).toBeUndefined();
    });
  });

  describe("speed", () => {
    it("parses explicit '1.5x'", () => {
      const { operations } = parseInstruction("acelera 1.5x", false);
      expect(operations).toContainEqual(
        expect.objectContaining({ type: "speed", speedFactor: 1.5 }),
      );
    });

    it("defaults to 1.5x when only 'acelera' is mentioned", () => {
      const { operations } = parseInstruction("deixa mais rapido", false);
      expect(operations).toContainEqual(
        expect.objectContaining({ type: "speed", speedFactor: 1.5 }),
      );
    });

    it("clamps absurd values out of range (>3)", () => {
      const { operations } = parseInstruction("acelera 10x", false);
      expect(operations.find((o) => o.type === "speed")).toBeUndefined();
    });
  });

  describe("aspect ratio", () => {
    it("detects vertical / reels / tiktok / 9:16", () => {
      for (const word of ["vertical", "reels", "tiktok", "9:16"]) {
        const { operations } = parseInstruction(`deixa ${word}`, false);
        expect(operations).toContainEqual(
          expect.objectContaining({ type: "aspect_vertical" }),
        );
      }
    });

    it("detects quadrado / feed", () => {
      const { operations } = parseInstruction("formato quadrado pro feed", false);
      expect(operations).toContainEqual(
        expect.objectContaining({ type: "aspect_square" }),
      );
    });
  });

  describe("vinhetas", () => {
    it("adds intro on 'vinheta'/'abertura'", () => {
      const { operations } = parseInstruction("coloca uma abertura legal", false);
      expect(operations).toContainEqual(
        expect.objectContaining({ type: "intro", brandName: "CR3SCE" }),
      );
    });

    it("adds outro on 'encerramento'", () => {
      const { operations } = parseInstruction(
        "coloca um encerramento",
        false,
      );
      expect(operations).toContainEqual(
        expect.objectContaining({ type: "outro" }),
      );
    });

    it("uses provided brandName", () => {
      const { operations } = parseInstruction("vinheta de abertura", false, "ACME");
      expect(operations).toContainEqual(
        expect.objectContaining({ brandName: "ACME" }),
      );
    });
  });

  describe("highlights", () => {
    it("detects 'melhores momentos'", () => {
      const { operations } = parseInstruction(
        "pega só os melhores momentos",
        false,
      );
      expect(operations).toContainEqual(
        expect.objectContaining({ type: "highlights" }),
      );
    });

    it("detects 'compilado'", () => {
      const { operations } = parseInstruction("faz um compilado", false);
      expect(operations.map((o) => o.type)).toContain("highlights");
    });

    it("does NOT trigger 'enhance' from 'melhores momentos'", () => {
      const { operations } = parseInstruction("melhores momentos", false);
      expect(operations.find((o) => o.type === "enhance")).toBeUndefined();
    });
  });

  describe("audio operations", () => {
    it("detects mute via 'sem som'", () => {
      const { operations } = parseInstruction("deixa sem som", false);
      expect(operations).toContainEqual(
        expect.objectContaining({ type: "mute" }),
      );
    });

    it("adds music op when hasMusic=true", () => {
      const { operations } = parseInstruction("trilha empolgante", true);
      expect(operations).toContainEqual(
        expect.objectContaining({ type: "music", musicVolume: 0.3 }),
      );
    });

    it("never adds music op when hasMusic=false", () => {
      const { operations } = parseInstruction(
        "adiciona uma musica de fundo",
        false,
      );
      expect(operations.find((o) => o.type === "music")).toBeUndefined();
    });

    it("uses higher music volume on 'alta'", () => {
      const { operations } = parseInstruction("trilha bem alta", true);
      const music = operations.find((o) => o.type === "music");
      expect(music?.musicVolume).toBe(0.6);
    });

    it("zeroes original volume when mute is also requested", () => {
      const { operations } = parseInstruction("sem som, com trilha", true);
      const music = operations.find((o) => o.type === "music");
      expect(music?.originalVolume).toBe(0);
    });
  });

  describe("complex combinations", () => {
    it("parses multiple operations in one sentence", () => {
      const { operations } = parseInstruction(
        "corta de 2 a 20, acelera 2x, deixa em reels com legendas",
        false,
      );
      const types = operations.map((o) => o.type);
      expect(types).toContain("trim");
      expect(types).toContain("speed");
      expect(types).toContain("aspect_vertical");
      expect(types).toContain("transcribe");
    });

    it("returns empty operations for empty/garbage input", () => {
      const { operations } = parseInstruction("xyz qwerty", false);
      expect(operations).toEqual([]);
    });
  });
});

describe("mergeOperations", () => {
  it("returns presets when AI list is empty", () => {
    const presets: VideoOperation[] = [
      { type: "trim", label: "Corte", startSecond: 0, endSecond: 10 },
    ];
    const merged = mergeOperations(presets, []);
    expect(merged).toEqual(presets);
  });

  it("appends AI ops that have unique types", () => {
    const presets: VideoOperation[] = [
      { type: "trim", label: "Corte" },
    ];
    const inferred: VideoOperation[] = [
      { type: "enhance", label: "Melhorar" },
      { type: "fade", label: "Fade" },
    ];
    const merged = mergeOperations(presets, inferred);
    expect(merged.map((o) => o.type)).toEqual(["trim", "enhance", "fade"]);
  });

  it("preserves preset version when type collides", () => {
    const presets: VideoOperation[] = [
      { type: "trim", label: "preset", startSecond: 5, endSecond: 10 },
    ];
    const inferred: VideoOperation[] = [
      { type: "trim", label: "ai", startSecond: 100, endSecond: 200 },
    ];
    const merged = mergeOperations(presets, inferred);
    const trim = merged.find((o) => o.type === "trim")!;
    expect(trim.label).toBe("preset");
    expect(trim.startSecond).toBe(5);
  });

  it("expands intro_outro into intro + outro", () => {
    const merged = mergeOperations(
      [],
      [{ type: "intro_outro", label: "vinheta", brandName: "X" }],
    );
    const types = merged.map((o) => o.type);
    expect(types).toContain("intro");
    expect(types).toContain("outro");
  });

  it("does not duplicate intro/outro if already in presets", () => {
    const merged = mergeOperations(
      [{ type: "intro", label: "preset intro" }],
      [{ type: "intro_outro", label: "ai", brandName: "X" }],
    );
    const intros = merged.filter((o) => o.type === "intro");
    expect(intros).toHaveLength(1);
    expect(intros[0].label).toBe("preset intro");
    expect(merged.find((o) => o.type === "outro")).toBeDefined();
  });
});
