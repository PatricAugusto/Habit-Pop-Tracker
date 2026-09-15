import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "../config/appConfig";

export function CardArtwork({ type, accent }) {
  const ink = colors.ink;
  const soft = "rgba(255, 248, 238, 0.72)";

  if (type === "water") {
    return (
      <Svg width="100%" height="100%" viewBox="0 0 260 190" fill="none">
        <Circle cx="205" cy="42" r="31" fill={soft} />
        <Path
          d="M-12 122C29 86 62 155 103 119C145 83 176 145 215 113C233 98 248 95 272 104"
          stroke={ink}
          strokeWidth="10"
          strokeLinecap="round"
        />
        <Path
          d="M-10 153C30 119 63 181 105 147C146 114 178 174 217 142C236 126 250 125 270 133"
          stroke={soft}
          strokeWidth="9"
          strokeLinecap="round"
        />
        <Path
          d="M50 23C58 34 61 41 61 49C61 59 54 66 45 66C36 66 29 59 29 49C29 41 37 31 50 23Z"
          fill={ink}
        />
      </Svg>
    );
  }

  if (type === "beer") {
    return (
      <Svg width="100%" height="100%" viewBox="0 0 260 190" fill="none">
        <Circle cx="208" cy="45" r="42" fill={soft} />
        <Rect x="74" y="42" width="91" height="112" rx="18" fill={ink} />
        <Path d="M165 67H181C193 67 201 76 201 88V107C201 119 193 128 181 128H165" stroke={ink} strokeWidth="11" />
        <Path d="M88 53H151" stroke={accent} strokeWidth="15" strokeLinecap="round" />
        <Path d="M97 81V132M119 81V132M141 81V132" stroke={accent} strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        <Path d="M48 164H212" stroke={ink} strokeWidth="8" strokeLinecap="round" />
        <Circle cx="55" cy="45" r="10" fill={ink} />
      </Svg>
    );
  }

  if (type === "cigarette") {
    return (
      <Svg width="100%" height="100%" viewBox="0 0 260 190" fill="none">
        <Path d="M160 62C135 49 151 30 175 39C197 47 185 23 208 27C230 31 215 55 237 57" stroke={ink} strokeWidth="8" strokeLinecap="round" />
        <Path d="M171 82C145 70 161 52 184 61C205 70 193 46 215 50" stroke={soft} strokeWidth="8" strokeLinecap="round" />
        <Rect x="42" y="104" width="164" height="38" rx="19" fill={ink} transform="rotate(-14 42 104)" />
        <Path d="M66 99L101 154" stroke={accent} strokeWidth="10" />
        <Path d="M202 65L229 71" stroke={accent} strokeWidth="7" strokeLinecap="round" />
        <Circle cx="223" cy="146" r="18" fill={soft} />
      </Svg>
    );
  }

  return (
    <Svg width="100%" height="100%" viewBox="0 0 260 190" fill="none">
      <Circle cx="133" cy="104" r="53" fill={ink} />
      <Circle cx="133" cy="104" r="37" fill={accent} />
      <Path d="M133 67V141M96 104H170M107 78L159 130M159 78L107 130" stroke={ink} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      <Path d="M75 32L79 45M61 40L72 49M198 45L190 56M211 34L200 45" stroke={ink} strokeWidth="7" strokeLinecap="round" />
      <Circle cx="39" cy="143" r="14" fill={soft} />
      <Circle cx="218" cy="137" r="24" fill={soft} />
    </Svg>
  );
}