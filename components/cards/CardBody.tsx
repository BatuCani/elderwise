import { ExplainCard } from "./ExplainCard";
import { InfoCard } from "./InfoCard";
import { ReminderCard } from "./ReminderCard";
import { StepsCard } from "./StepsCard";
import type { CardProps } from "./types";

// Picks the right card for every answer type except "warning", which AnswerView draws itself.
export function CardBody(props: CardProps) {
  switch (props.answer.type) {
    case "reminder":
      return <ReminderCard {...props} />;
    case "steps":
      return <StepsCard {...props} />;
    case "explain":
      return <ExplainCard {...props} />;
    default:
      return <InfoCard {...props} />;
  }
}
