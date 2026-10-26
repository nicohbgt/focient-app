/** GENERATED FILE. Source: ../tokens/typography-token.json */
export type TypographyStyleName = 'display' | 'h1' | 'h2' | 'h3' | 'body-lg' | 'body-md' | 'label-md' | 'caption' | 'micro';
export type TypographyBreakpoint = 'mobile' | 'desktop';
export interface TypographyStyle {
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly letterSpacing: string;
  readonly fontWeight: number;
}
export interface TypographyTokens {
  readonly fontFamily: readonly string[];
  readonly fontWeight: Readonly<Record<string, number>>;
  readonly tabularFigures: string;
  readonly mobile: Readonly<Record<TypographyStyleName, TypographyStyle>>;
  readonly desktop: Readonly<Record<TypographyStyleName, TypographyStyle>>;
}
export declare const typographyTokens: Readonly<TypographyTokens>;
