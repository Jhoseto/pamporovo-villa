import useEmblaCarousel from "embla-carousel-react";

type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

export type ContinuousScrollController = {
  play: () => void;
  stop: () => void;
  isPlaying: () => boolean;
  setSpeed: (speed: number) => void;
  destroy: () => void;
};

type ContinuousScrollOptions = {
  speed?: number;
  direction?: "forward" | "backward";
};

/**
 * Continuous auto-scroll for Embla v8 (matches official Auto Scroll plugin motion model).
 */
export function attachContinuousScroll(
  emblaApi: EmblaApi,
  { speed = 1.2, direction = "forward" }: ContinuousScrollOptions = {}
): ContinuousScrollController {
  const engine = emblaApi.internalEngine();
  const defaultScrollBody = engine.scrollBody;
  let running = false;
  let speedPx = speed;

  function createAutoScrollBody() {
    const {
      location,
      previousLocation,
      offsetLocation,
      target,
      scrollTarget,
      index,
      indexPrevious,
      limit: { reachedMin, reachedMax, constrain },
      options: { loop },
    } = engine;

    const directionSign = direction === "forward" ? -1 : 1;
    const noop = () => self;

    let bodyVelocity = 0;
    let scrollDirection = 0;
    let rawLocation = location.get();
    let rawLocationPrevious = 0;
    let hasSettled = false;

    function seek() {
      previousLocation.set(location);

      bodyVelocity = directionSign * speedPx;
      rawLocation += bodyVelocity;
      location.add(bodyVelocity);
      target.set(location);

      const directionDiff = rawLocation - rawLocationPrevious;
      scrollDirection = Math.sign(directionDiff);
      rawLocationPrevious = rawLocation;

      const currentIndex = scrollTarget.byDistance(0, false).index;
      if (index.get() !== currentIndex) {
        indexPrevious.set(index.get());
        index.set(currentIndex);
        emblaApi.emit("select");
      }

      const reachedEnd =
        direction === "forward"
          ? reachedMin(offsetLocation.get())
          : reachedMax(offsetLocation.get());

      if (!loop && reachedEnd) {
        hasSettled = true;
        const constrainedLocation = constrain(location.get());
        location.set(constrainedLocation);
        target.set(constrainedLocation);
        stop();
      }

      return self;
    }

    const self = {
      direction: () => scrollDirection,
      duration: () => -1,
      velocity: () => bodyVelocity,
      settled: () => hasSettled,
      seek,
      useBaseFriction: noop,
      useBaseDuration: noop,
      useFriction: noop,
      useDuration: noop,
    };

    return self;
  }

  function play() {
    if (running || emblaApi.scrollSnapList().length <= 1) return;
    engine.scrollBody = createAutoScrollBody();
    engine.animation.start();
    running = true;
  }

  function stop() {
    if (!running) return;
    engine.scrollBody = defaultScrollBody;
    running = false;
  }

  function setSpeed(nextSpeed: number) {
    speedPx = nextSpeed;
  }

  function destroy() {
    stop();
  }

  return {
    play,
    stop,
    isPlaying: () => running,
    setSpeed,
    destroy,
  };
}

export function getContinuousScrollSpeed(): number {
  if (typeof window === "undefined") return 1.2;
  return window.matchMedia("(max-width: 767px)").matches ? 0.85 : 1.2;
}
