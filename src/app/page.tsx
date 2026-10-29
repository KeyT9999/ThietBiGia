import { LivingTimelineStage } from "@/components/timeline/LivingTimelineStage";
import { HomeIntroduction } from "@/components/home/HomeIntroduction";

export default function HomePage() {
  return (
    <>
      <HomeIntroduction />
      <div id="living-timeline">
        <LivingTimelineStage />
      </div>
    </>
  );
}
