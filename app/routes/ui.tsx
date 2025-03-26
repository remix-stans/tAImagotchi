import type { Message } from "@ai-sdk/react";
import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import DayJSUtc from "dayjs/plugin/utc";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Send, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { State } from "../shared";
import { INITIAL_STATE, getAge } from "../shared";

import baseballBat from "@/assets/baseball-bat.webp";
import eat from "@/assets/eat.webp";
import egg from "@/assets/egg.webp";
import lightbulb from "@/assets/lightbulb.webp";
import poop from "@/assets/poop.webp";
import room from "@/assets/room.webp";
import shower from "@/assets/shower.webp";
import syringe from "@/assets/syringe.webp";
import toilet from "@/assets/toilet.webp";
import workout from "@/assets/workout.webp";

import { useScrollAnchor } from "@/lib/hooks/use-scroll-anchor";

dayjs.extend(DayJSUtc);
dayjs.extend(tz);

export default function Chat() {
	const [state, setState] = useState<State>(INITIAL_STATE);

	const { containerRef, messagesRef, scrollToBottom } = useScrollAnchor();

	useEffect(() => {
		if (state.initialized) {
			scrollToBottom();
		}
	}, [scrollToBottom, state.initialized]);

	const agent = useAgent({
		agent: "tamagochi",
		prefix: "agents",
		host: "http://localhost:3000",
		onStateUpdate(state, source) {
			setState(state as State);
		},
	});

	const {
		messages: agentMessages,
		input: agentInput,
		handleInputChange: handleAgentInputChange,
		handleSubmit: handleAgentSubmit,
		clearHistory,
	} = useAgentChat({
		agent,
		maxSteps: 5,
	});

	// Scroll to bottom when messages change
	useEffect(() => {
		agentMessages.length > 0 && scrollToBottom();
	}, [agentMessages, scrollToBottom]);

	// Calculate pet age in days
	const calculateAge = () => {
		if (!state.createdAt) return 0;
		return getAge(state.createdAt);
	};

	// Get status text based on stat value
	const getStatusText = (value: number) => {
		if (value > 70) return "Good";
		if (value > 40) return "Okay";
		return "Poor";
	};

	// Get color based on stat value
	const getStatusColor = (value: number) => {
		if (value > 70) return "text-green-500";
		if (value > 40) return "text-yellow-500";
		return "text-red-500";
	};

	// Get progress color based on stat value
	const getProgressColor = (value: number) => {
		if (value > 70) return "bg-green-500";
		if (value > 40) return "bg-yellow-500";
		return "bg-red-500";
	};

	// const submitChatMessage = (e: React.FormEvent<HTMLFormElement>) => {
	//   e.preventDefault();
	//   const age = getAge(state.createdAt);
	//   if (age === 0) {
	//     agent.call("submitChatMessageWhileEgg", [agentInput]);
	//   } else {
	//     console.log("here");
	//     handleAgentSubmit(e);
	//   }
	// };

	return (
		<div
			data-sleeping={state.isSleeping}
			className="relative h-[100vh] w-full bg-center bg-cover bg-no-repeat after:absolute after:inset-0 after:backdrop-blur-xs data-[sleeping=false]:[background-image:url('/images/morning.webp')] data-[sleeping=true]:[background-image:url('/images/night.webp')]"
		>
			{!state.initialized ? (
				<div className="relative z-10 flex h-full w-full items-center justify-center">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							const formData = new FormData(e.target as HTMLFormElement);
							const name = formData.get("name") as string;
							const personality = formData.get("personality") as string;
							if (!name || !personality) return;
							agent.call("init", [
								personality,
								name,
								Intl.DateTimeFormat().resolvedOptions().timeZone,
							]);
						}}
						className=" mx-auto w-[40rem] max-w-[calc(100vw-3rem)]"
					>
						<div className="flex items-center justify-between rounded-t-3xl border-border border-b bg-background px-4 py-3">
							<h2 className="font-semibold text-base">
								Create Your Tamagotchi
							</h2>
						</div>

						<div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-b-3xl border-border bg-background p-8">
							<div className="w-full max-w-xs space-y-4">
								<div className="space-y-2">
									<label htmlFor="name" className="block font-medium text-sm">
										Name your pet
									</label>
									<Input
										id="name"
										placeholder="e.g., Pixelpal"
										name="name"
										required
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="personality"
										className="block font-medium text-sm"
									>
										Give it a personality
									</label>
									<Input
										id="personality"
										placeholder="e.g., Playful and energetic"
										name="personality"
										required
									/>
								</div>

								<Button
									type="submit"
									className="mt-4 w-full bg-[#F48120] hover:bg-[#F48120]/80"
								>
									Create Pet
								</Button>
							</div>
						</div>
					</form>
				</div>
			) : (
				<div className="relative z-10 flex h-full min-h-0 grid-cols-12 flex-col md:grid">
					<div className="col-span-8 flex flex-col border-border px-2">
						<div className="relative flex flex-1 flex-col items-center justify-center px-4 py-6">
							<div className="flex justify-between gap-2 px-4 py-6">
								<div className="h-12 w-12 overflow-hidden rounded-lg">
									<img
										src={baseballBat}
										alt="baseball bat"
										className="h-full w-full"
									/>
								</div>
								<div className="h-12 w-12 overflow-hidden rounded-lg">
									<img src={eat} alt="eat" className="h-full w-full" />
								</div>
								<div className="h-12 w-12 overflow-hidden rounded-lg">
									<img src={workout} alt="workout" className="h-full w-full" />
								</div>
								<div className="h-12 w-12 overflow-hidden rounded-lg">
									<img
										src={lightbulb}
										alt="lightbulb"
										className="h-full w-full"
									/>
								</div>
								<div className="h-12 w-12 overflow-hidden rounded-lg">
									<img src={syringe} alt="syringe" className="h-full w-full" />
								</div>
								<div className="h-12 w-12 overflow-hidden rounded-lg">
									<img src={shower} alt="shower" className="h-full w-full" />
								</div>
								<Button
									className="h-12 w-12 overflow-hidden rounded-lg p-0 transition-transform hover:scale-105"
									onClick={() => {
										agent.call("interact", ["cleanPoop"]);
									}}
								>
									<img src={toilet} alt="toilet" className="h-full w-full" />
								</Button>
							</div>
							<div className="grid size-[30rem] grid-cols-7 place-items-end justify-items-center">
								<img
									src={egg}
									alt="egg"
									className="relative mb-8 ml-8 size-48 [grid-area:1/3/1/span_2]"
								/>
								{Array(state.poops)
									.fill(0)
									.map((value, index) => (
										<img
											key={`poop.${value + index}`}
											// @ts-ignore It is supported
											style={{ "grid-area": `1/${index + 1}` }}
											src={poop}
											alt="poop"
											className="relative mb-8 size-12"
										/>
									))}
								<img
									src={room}
									alt="room"
									className="size-[30rem] rounded-lg [grid-area:1/1/1/span_7]"
								/>
							</div>
						</div>
					</div>
					<div className="col-span-4 h-full w-full overflow-hidden">
						<div className="flex h-full flex-col">
							<div className="flex-1 overflow-auto p-2" ref={containerRef}>
								<div
									className="flex min-h-full flex-col gap-2 overflow-visible"
									ref={messagesRef}
								>
									{agentMessages.map((m: Message) => {
										const isUser = m.role === "user";

										return (
											<div key={m.id} className="mb-1">
												<div
													className={`max-w-[90%] ${isUser ? "ml-auto" : "mr-auto"} rounded px-2 py-1.5 text-sm ${
														isUser
															? "bg-primary"
															: "bg-gray-100 dark:bg-gray-800"
													}`}
												>
													{m.parts?.map((part, i) => {
														if (part.type === "text") {
															return (
																<div
																	key={`part-${m.id}-${i}`}
																	className="whitespace-pre-wrap"
																>
																	{part.text}
																</div>
															);
														}
														return null;
													})}
												</div>
											</div>
										);
									})}
								</div>
							</div>
							<form
								onSubmit={handleAgentSubmit}
								className="sticky bottom-0 w-full border-muted border-t bg-background px-4 py-3"
							>
								<div className="flex space-x-2">
									<Input
										value={agentInput}
										onChange={handleAgentInputChange}
										placeholder="Talk..."
										className="h-6 flex-1 px-2 py-0 text-[10px]"
									/>
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										className="h-6 w-6 min-w-0 p-0"
									>
										<Send className="h-3 w-3" />
										<span className="sr-only">Send</span>
									</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
			{/* {!state.initialized ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const name = formData.get("name") as string;
            const personality = formData.get("personality") as string;
            if (!name || !personality) return;
            agent.call("init", [
              personality,
              name,
              Intl.DateTimeFormat().resolvedOptions().timeZone,
            ]);
          }}
          className="bg-background h-[calc(100vh-2rem)] w-full mx-auto max-w-lg flex flex-col shadow-xl rounded-3xl overflow-hidden relative border border-assistant-border/20"
        >
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background sticky top-0 z-10 rounded-t-3xl">
            <h2 className="font-semibold text-base">Create Your Tamagotchi</h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={toggleTheme}
              type="button"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
            <div className="w-full max-w-xs space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Name your pet
                </label>
                <Input
                  id="name"
                  placeholder="e.g., Pixelpal"
                  name="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="personality"
                  className="block text-sm font-medium"
                >
                  Give it a personality
                </label>
                <Input
                  id="personality"
                  placeholder="e.g., Playful and energetic"
                  name="personality"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4 bg-[#F48120] hover:bg-[#F48120]/80"
              >
                Create Pet
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="h-[100vh] w-full bg-gradient-to-br from-[#F48120]/10 via-background/30 to-[#FAAD3F]/10 backdrop-blur-md p-4 flex justify-center items-center bg-fixed overflow-hidden">
          {showDebug && (
            <div className="absolute top-2 right-2 bg-background/90 p-4 rounded-md border border-border max-w-xs max-h-96 overflow-auto">
              <pre className="text-xs">{JSON.stringify(state, null, 2)}</pre>
            </div>
          )}

          {!state.initialized ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const name = formData.get("name") as string;
                const personality = formData.get("personality") as string;
                if (!name || !personality) return;
                agent.call("init", [personality, name]);
              }}
              className="bg-background h-[calc(100vh-2rem)] w-full mx-auto max-w-lg flex flex-col shadow-xl rounded-3xl overflow-hidden relative border border-assistant-border/20"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background sticky top-0 z-10 rounded-t-3xl">
                <h2 className="font-semibold text-base">
                  Create Your Tamagotchi
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9"
                  onClick={toggleTheme}
                  type="button"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                <div className="w-full max-w-xs space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Name your pet
                    </label>
                    <Input
                      id="name"
                      placeholder="e.g., Pixelpal"
                      name="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="personality"
                      className="block text-sm font-medium"
                    >
                      Give it a personality
                    </label>
                    <Input
                      id="personality"
                      placeholder="e.g., Playful and energetic"
                      name="personality"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-4 bg-[#F48120] hover:bg-[#F48120]/80"
                  >
                    Create Pet
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="relative h-[calc(100vh-2rem)] w-full mx-auto max-w-sm flex flex-col items-center">
              <div className="relative bg-[#ffccaa] dark:bg-[#ff9966] w-80 h-[440px] rounded-[50%] shadow-xl border-8 border-[#ffaa77] dark:border-[#ff8855] overflow-visible flex flex-col items-center">
                <div className="w-52 h-52 bg-[#dddddd] dark:bg-[#333333] mt-12 rounded-2xl border-4 border-[#aaaaaa] dark:border-[#222222] relative flex flex-col">
                  <div className="flex-1 bg-white dark:bg-black p-1.5 m-1.5 rounded overflow-hidden">
                    {activeTab === "pet" && (
                      <div className="h-full flex flex-col items-center justify-between">
                        <div className="flex gap-2 mt-1 self-stretch justify-center">
                          <button
                            type="button"
                            onClick={() => agent.call("interact", ["workout"])}
                            className="bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-lg px-2 py-1 text-[9px] hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors flex items-center gap-1"
                          >
                            <Dumbbell className="h-3 w-3" /> Workout
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              agent.call("interact", ["takeMedicine"])
                            }
                            className="bg-pink-100 dark:bg-pink-900/40 border border-pink-200 dark:border-pink-700 text-pink-700 dark:text-pink-300 rounded-lg px-2 py-1 text-[9px] hover:bg-pink-200 dark:hover:bg-pink-800/50 transition-colors flex items-center gap-1"
                          >
                            <Heart className="h-3 w-3" /> Medicine
                          </button>
                        </div>

                        <div className="relative flex items-center justify-center">
                          <div className="text-6xl select-none">
                            {state.age === 0 && "🥚"}
                            {state.age === 1 && "🐣"}
                            {state.age === 2 && "🐥"}
                            {state.age === 3 && "🐤"}
                            {state.age === 4 && "🐔"}
                            {state.age === 5 && "🦚"}
                          </div>

                          <div className="absolute -bottom-1 -right-1 bg-[#F48120] text-white text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            Lv{state.age}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                          {state.satiety < 40 && (
                            <div className="pixel-icon" title="Hungry">
                              🍕
                            </div>
                          )}
                          {state.energy < 40 && (
                            <div className="pixel-icon" title="Tired">
                              😴
                            </div>
                          )}
                          {state.mood < 40 && (
                            <div className="pixel-icon" title="Sad">
                              😢
                            </div>
                          )}
                          {state.hygiene < 40 && (
                            <div className="pixel-icon" title="Dirty">
                              💦
                            </div>
                          )}
                          {state.health < 40 && (
                            <div className="pixel-icon" title="Sick">
                              🤒
                            </div>
                          )}
                        </div>

                        <div className="text-center mt-2 text-xs font-pixel">
                          <div>{state.name}</div>
                          <div className="text-[10px] opacity-70">
                            Age: {calculateAge()} days
                          </div>
                        </div>

                        <div className="flex gap-2 mt-2 mb-1">
                          <button
                            type="button"
                            onClick={() => agent.call("interact", ["feed"])}
                            className="bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 rounded-lg px-2 py-1 text-[9px] hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors flex items-center gap-1"
                          >
                            <Pizza className="h-3 w-3" /> Feed
                          </button>
                          <button
                            type="button"
                            onClick={() => agent.call("interact", ["play"])}
                            className="bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg px-2 py-1 text-[9px] hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors flex items-center gap-1"
                          >
                            <Bot className="h-3 w-3" /> Play
                          </button>
                          <button
                            type="button"
                            onClick={() => agent.call("interact", ["clean"])}
                            className="bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg px-2 py-1 text-[9px] hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors flex items-center gap-1"
                          >
                            <Droplet className="h-3 w-3" /> Clean
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === "stats" && (
                      <div className="h-full flex flex-col p-1 text-xs">
                        <div className="font-bold mb-1 text-center">Status</div>

                        <div className="grid grid-cols-1 gap-1.5">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <span className="text-[10px]">Mood</span>
                            <Progress
                              value={state.mood}
                              className={`h-1.5 flex-1 ${getProgressColor(state.mood)}`}
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <Pizza className="h-3 w-3 text-amber-500" />
                            <span className="text-[10px]">Food</span>
                            <Progress
                              value={state.energy}
                              className={`h-1.5 flex-1 ${getProgressColor(state.satiety)}`}
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <Battery className="h-3 w-3 text-green-500" />
                            <span className="text-[10px]">Energy</span>
                            <Progress
                              value={state.energy}
                              className={`h-1.5 flex-1 ${getProgressColor(state.energy)}`}
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-pink-500" />
                            <span className="text-[10px]">Health</span>
                            <Progress
                              value={state.health}
                              className={`h-1.5 flex-1 ${getProgressColor(state.health)}`}
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <Droplet className="h-3 w-3 text-blue-500" />
                            <span className="text-[10px]">Clean</span>
                            <Progress
                              value={state.hygiene}
                              className={`h-1.5 flex-1 ${getProgressColor(state.hygiene)}`}
                            />
                          </div>
                        </div>

                        <div className="mt-1.5 text-[10px] text-center opacity-70">
                          Personality: {state.personality}
                        </div>
                      </div>
                    )}

                    {activeTab === "chat" && (
                      <div className="h-full flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto text-[10px]">
                          {agentMessages.length === 0 && (
                            <div className="h-full flex items-center justify-center">
                              <div className="text-center text-[10px] px-2">
                                <div>Talk to {state.name}!</div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-1 p-1">
                            {agentMessages.map((m: Message, index) => {
                              const isUser = m.role === "user";

                              return (
                                <div key={m.id} className="mb-1">
                                  <div
                                    className={`max-w-[90%] ${isUser ? "ml-auto" : "mr-auto"} px-1.5 py-1 rounded text-[9px] ${
                                      isUser
                                        ? "bg-[#F48120]/20"
                                        : "bg-gray-100 dark:bg-gray-800"
                                    }`}
                                  >
                                    {m.parts?.map((part, i) => {
                                      if (part.type === "text") {
                                        return (
                                          <div
                                            key={`part-${m.id}-${i}`}
                                            className="whitespace-pre-wrap"
                                          >
                                            {part.text}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        </div>

                        <form
                          onSubmit={handleAgentSubmit}
                          className="p-1 border-t border-gray-200 dark:border-gray-800"
                        >
                          <div className="flex gap-1">
                            <Input
                              value={agentInput}
                              onChange={handleAgentInputChange}
                              placeholder="Talk..."
                              className="flex-1 h-6 text-[10px] py-0 px-2"
                            />
                            <Button
                              type="submit"
                              size="sm"
                              className="h-6 w-6 p-0 min-w-0"
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    className={`w-16 h-8 rounded-xl text-xs font-bold ${activeTab === "pet" ? "bg-[#F48120] text-white" : "bg-[#ddd] dark:bg-[#444] text-[#333] dark:text-white"}`}
                    onClick={() => setActiveTab("pet")}
                  >
                    Pet
                  </button>

                  <button
                    type="button"
                    className={`w-16 h-8 rounded-xl text-xs font-bold ${activeTab === "stats" ? "bg-[#F48120] text-white" : "bg-[#ddd] dark:bg-[#444] text-[#333] dark:text-white"}`}
                    onClick={() => setActiveTab("stats")}
                  >
                    Stats
                  </button>

                  <button
                    type="button"
                    className={`w-16 h-8 rounded-xl text-xs font-bold ${activeTab === "chat" ? "bg-[#F48120] text-white" : "bg-[#ddd] dark:bg-[#444] text-[#333] dark:text-white"}`}
                    onClick={() => setActiveTab("chat")}
                  >
                    Chat
                  </button>
                </div>

                <div className="flex absolute bottom-8 gap-3">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-[#ddd] dark:bg-[#444] shadow-md flex items-center justify-center"
                    onClick={toggleTheme}
                    title="Toggle Theme"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-[#ddd] dark:bg-[#444] shadow-md flex items-center justify-center"
                    onClick={() => setShowDebug(!showDebug)}
                    title="Toggle Debug"
                  >
                    <Bug className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-red-500 text-white shadow-md flex items-center justify-center"
                    onClick={() => {
                      if (confirm("Are you sure you want to reset your pet?")) {
                        agent.call("reset");
                      }
                    }}
                    title="Reset Pet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )} */}
		</div>
	);
}
