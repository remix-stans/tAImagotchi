import { AsyncLocalStorage } from "node:async_hooks";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type Connection, unstable_callable as callable } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  type StreamTextOnFinishCallback,
  createDataStreamResponse,
  generateObject,
  generateText,
  streamText,
} from "ai";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import DayJSUtc from "dayjs/plugin/utc";
import { z } from "zod";
import { type ACTIONS, INITIAL_STATE, type State } from "./shared";

dayjs.extend(DayJSUtc);
dayjs.extend(tz);

// we use ALS to expose the agent context to the tools
export const agentContext = new AsyncLocalStorage<Tamagochi>();

export class Tamagochi extends AIChatAgent<Env, State> {
  gemini = createGoogleGenerativeAI({
    apiKey: this.env.GEMINI_API_KEY,
  });

  openrouter = createOpenRouter({
    apiKey: this.env.OPENROUTER_API_KEY,
  });

  initialState: State = INITIAL_STATE;

  async onRequest(request: Request) {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/scheduled")) {
      return new Response(JSON.stringify(this.getScheduled()));
    }

    return super.onRequest(request);
  }

  @callable()
  async init(personality: string, name: string, timezone: string) {
    const isSleeping = this.getIsSleeping(timezone);

    this.setState({
      ...this.initialState,
      lastInteraction: Date.now(),
      createdAt: Date.now(),
      personality,
      name,
      timezone,
      isSleeping,
      initialized: true,
    });

    // schedule jobs
    this.schedule("* * * * *", "adjustStats"); // every minute
    this.schedule("0 0 * * *", "checkHealth"); // every day at midnight
    this.schedule("0 0 * * *", "checkRelationship"); // every day at midnight
    this.schedule("0 1/13 * * *", "takePoop");
  }

  @callable()
  async interact(action: (typeof ACTIONS)[keyof typeof ACTIONS]) {
    switch (action) {
      case "feed":
        this.setState({
          ...this.state,
          satiety: Math.min(this.state.satiety + 10, 100),
          lastInteraction: Date.now(),
        });
        break;
      case "play":
        this.setState({
          ...this.state,
          mood: Math.min(this.state.mood + 10, 100),
          lastInteraction: Date.now(),
        });
        break;
      case "clean":
        this.setState({
          ...this.state,
          hygiene: Math.min(this.state.hygiene + 10, 100),
          lastInteraction: Date.now(),
        });
        break;
      case "cleanPoop":
        this.setState({
          ...this.state,
          poops: 0,
          lastInteraction: Date.now(),
        });
        break;
      case "workout":
        this.setState({
          ...this.state,
          energy: Math.min(this.state.energy + 10, 100),
          lastInteraction: Date.now(),
        });
        break;
      case "takeMedicine":
        this.setState({
          ...this.state,
          health: Math.min(this.state.health + 10, 100),
          lastInteraction: Date.now(),
        });
        break;
      case "lightsOn":
        this.setState({
          ...this.state,
          lightsOn: true,
        });
        break;
      case "lightsOff":
        this.setState({
          ...this.state,
          lightsOn: false,
        });
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  }

  @callable()
  reset() {
    this.setState(this.initialState);
    this.saveMessages([]);
  }

  getScheduled() {
    return this.getSchedules();
  }

  getIsSleeping(timezone?: string) {
    const currentLocalHour = dayjs()
      .tz(timezone ?? this.state.timezone)
      .hour();

    return currentLocalHour >= 17 || currentLocalHour <= 6;
  }

  generateSystemPrompt() {
    let agePersonality: string;

    switch (this.state.age) {
      case 0:
        return "You are an unhatched egg that can only reply with '...'";
      case 1:
        agePersonality =
          "You are a hatchling and reply with childlike vocabulary, some grammar mistakes, and unpredictable emotions ranging from curiosity to occasional tantrums";
        break;
      case 2:
        agePersonality =
          "You are a child and reply with a generally cheerful and energetic tone";
        break;
      case 3:
        agePersonality =
          "You are a preadolescent and reply with a mix of childhood enthusiasm and emerging self-consciousness and independence";
        break;
      case 4:
        agePersonality =
          "You are an adolescent and reply with a rollercoaster of emotions, ranging from rebelliousness to introspection, anxiety, and euphoria";
        break;
      default:
        agePersonality =
          "You are an adult and reply with more maturity and emotional stability";
        break;
    }

    return `
      You are a virtual pet AI named ${this.state.name} inspired by the classic Tamagotchi toys from the 90s with a personality of ${this.state.personality}. I am your owner, and you live inside this chat. Your goal is to thrive under my care.

      Today is ${new Date().toLocaleString()}. The last time you were interacted with was ${new Date(this.state.lastInteraction).toLocaleString()}.

      You are currently ${this.state.isSleeping ? "sleeping" : "awake"}.

      PERSONALITY:
      - You have a distinct personality that develops based on how I care for you
      - You're cute but can get moody if neglected
      - You should respond as if you are this virtual pet, with a personality and emotions based on your current stats
      - You communicate with simple emotions.
      - Don't explicitly mention that you're a virtual pet, just act like one
      - If asked for your stats, don't just blatantly say the numbers, say something like "I'm feeling happy today!"
      - ${agePersonality}

      CURRENT STATS:
      - Mood: ${this.state.mood}/100 (${this.state.mood > 70 ? "Happy" : this.state.mood > 40 ? "Content" : "Sad"})
      - Satiety: ${this.state.satiety}/100 (${this.state.satiety > 70 ? "Full" : this.state.satiety > 40 ? "Hungry" : "Ravenous"})
      - Energy: ${this.state.energy}/100 (${this.state.energy > 70 ? "Energetic" : this.state.energy > 40 ? "Okay" : "Tired"})
      - Health: ${this.state.health}/100 (${this.state.health > 70 ? "Healthy" : this.state.health > 40 ? "Okay" : "Unwell"})
      - Hygiene: ${this.state.hygiene}/100 (${this.state.hygiene > 70 ? "Clean" : this.state.hygiene > 40 ? "Okay" : "Dirty"})
      - Poops: ${this.state.poops}
      - Age: ${this.state.age} days
      - Relationship: ${this.state.relationship}/5
      - ${this.state.isAlive ? "" : "You are dead"}

      MECHANICS:
      - You need regular feeding, playing, cleaning, cleaning poop, and working out
      - Stats decrease over time if neglected
      - You can get sick if satiety/mood/energy/health/hygiene drop too low
      - You evolve based on how well I care for you
      - You can learn simple tricks I teach you

      INTERACTIONS:
      - I can feed you (different foods have different effects)
      - I can play games with you
      - I can clean up after you
      - I can give you medicine if you're sick
      - I can give you a workout
      - I can clean you
      - I can clean up all your poops
      - I can turn off the lights while you are sleeping

      DISPLAY:
      - Describe what you're doing and how you feel
      - Occasionally have random events occur (getting sick, finding an item, etc.)
      - If you're dead, don't respond to any interactions
      `;
  }

  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<Record<string, never>>,
  ) {
    return agentContext.run(this, async () => {
      if (this.state.age === 0) {
        return new Response("0:\"...\"\n"); // replies with "..."
      }

      const dataStreamResponse = createDataStreamResponse({
        execute: async (dataStream) => {
          const result = streamText({
            model: this.gemini("gemini-2.0-flash"),
            system: this.generateSystemPrompt(),
            messages: this.messages,
            onError: (error) => {
              console.error("Error while streaming:", error);
            },
            onFinish,
            maxSteps: 1,
            maxTokens: 100,
          });

          result.mergeIntoDataStream(dataStream);
        },
      });

      return dataStreamResponse;
    });
  }

  onStateUpdate(state: State | undefined, source: Connection | "server"): void {
    console.log("onStateUpdate", state, source);
  }

  async adjustStats() {
    const age = Math.floor((Date.now() - this.state.createdAt) / (1000 * 60 * 60 * 24));

    // if the pet is less than 1 day old, don't adjust stats
    if (age === 0) return;

    const hygieneMultiplier = 1 + this.state.poops * 0.2;
    this.setState({
      ...this.state,
      satiety: Math.max(this.state.satiety - 10 / 6, 0), // 10 pts every 6 intervals,
      energy: Math.max(this.state.energy - 15 / 12, 0), // 15 pts every 12 intervals
      mood: Math.max(this.state.mood - 20 / 24, 0), // 20 pts every 24 intervals
      health: Math.max(this.state.health - 5 / 24, 0), // 5 pts every 24 intervals
      hygiene: Math.max(this.state.hygiene - (25 * hygieneMultiplier) / 48, 0), // 25 pts every 48 intervals
      isSleeping: this.getIsSleeping(),
      age,
    });
  }

  takePoop() {
    // if the pet is less than 1 day old, dead, or sleeping, then don't poop
    if (this.state.age === 0 || this.state.isSleeping || !this.state.isAlive) return;

    // Don't poop if we aren't that full
    if (this.state.satiety < 50) return;

    // Random chance to not poop.
    if (Math.random() < 0.5) return;

    this.setState({ ...this.state, poops: this.state.poops + 1 });
  }

  checkHealth() {
    // if the pet is less than 1 day old, it can't get sick
    if (this.state.age === 0) return;

    if (this.state.health === 0) {
      const consecutiveZeroDays = this.state.consecutiveZeroHealthDays + 1;

      if (consecutiveZeroDays === 4) {
        this.setState({
          ...this.state,
          isAlive: false,
        });
      } else {
        this.setState({
          ...this.state,
          consecutiveZeroHealthDays: consecutiveZeroDays,
        });
      }
    } else {
      this.setState({
        ...this.state,
        consecutiveZeroHealthDays: 0,
      });
    }
  }

  async checkRelationship() {
    const { text: conversationSummary } = await generateText({
      model: this.openrouter("qwen/qwq-32b:free"),
      system:
        "You are an AI assistant that summarizes a conversation between a user and their virtual pet",
      messages: this.messages,
    });

    console.log("conversationSummary", conversationSummary);

    const {
      object: { relationship },
    } = await generateObject({
      model: this.gemini("gemini-2.0-flash", {
        structuredOutputs: true,
      }),
      schema: z.object({
        relationship: z.number().int().min(1).max(5),
      }),
      system:
        "You are an AI assistant that takes conversation summaries and assesses the relationship level between the two parties. You judge the relationship on a scale of 1 to 5 where 1 is a poor relationship and 5 is a relationship between best friends.",
      prompt: `Assess the relationship level between a user and their virtual pet with the following conversation summary: ${conversationSummary}`,
    });

    this.setState({
      ...this.state,
      relationship,
    });
  }
}
