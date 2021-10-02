import type { Scenario } from "../../types/magireco/scenario.ts";

export const stories = {
  intro_1: { name: "自己紹介①" },
  intro_2: { name: "自己紹介②" },
  episode_1: { name: "魔法少女ストーリー①" },
  episode_2: { name: "魔法少女ストーリー②" },
  episode_3: { name: "魔法少女ストーリー③" },
  grow: { name: "強化完了" },
  grow_max: { name: "強化(Lv最大時)" },
  grow_episode: { name: "エピソードLvアップ" },
  grow_release_1: { name: "魔力解放①" },
  grow_release_2: { name: "魔力解放②" },
  grow_release_3: { name: "魔力解放③" },
  grow_magia: { name: "マギアLvアップ" },
  grow_awake_1: { name: "魔法少女覚醒①" },
  grow_awake_2: { name: "魔法少女覚醒②" },
  grow_awake_3: { name: "魔法少女覚醒③" },
  grow_awake_4: { name: "魔法少女覚醒④" },
  greet_first: { name: "ログイン①(初回ログイン時)" },
  greet_morning: { name: "ログイン②(朝)" },
  greet_day: { name: "ログイン③(昼)" },
  greet_evening: { name: "ログイン④(夜)" },
  greet_night: { name: "ログイン⑤(深夜)" },
  greet: { name: "ログイン⑥(その他)" },
  greet_ap: { name: "ログイン⑦(AP最大時)" },
  greet_bp: { name: "ログイン⑧(BP最大時)" },
  talk_1: { name: "魔法少女タップ①" },
  talk_2: { name: "魔法少女タップ②" },
  talk_3: { name: "魔法少女タップ③" },
  talk_4: { name: "魔法少女タップ④" },
  talk_5: { name: "魔法少女タップ⑤" },
  talk_6: { name: "魔法少女タップ⑥" },
  talk_7: { name: "魔法少女タップ⑦" },
  talk_8: { name: "魔法少女タップ⑧" },
  talk_9: { name: "魔法少女タップ⑨" },
  talk_10: { name: "魔法少女タップ⑩" },
  battle_start: { name: "クエスト開始" },
  battle_win_1: { name: "クエスト勝利①" },
  battle_win_2: { name: "クエスト勝利②" },
  battle_win_3: { name: "クエスト勝利③" },
  battle_win_4: { name: "クエスト勝利③" },
  magia_1: { name: "マギア①" },
  magia_2: { name: "マギア②" },
  magia_3: { name: "マギア③" },
  magia_4: { name: "マギア④" },
} as const;

export const playlist = [
  {
    title: "魔法少女",
    stories: [
      stories.intro_1,
      stories.intro_2,
      stories.episode_1,
      stories.episode_2,
      stories.episode_3,
    ],
  },
  {
    title: "育成",
    stories: [
      stories.grow,
      stories.grow_max,
      stories.grow_episode,
      stories.grow_release_1,
      stories.grow_release_2,
      stories.grow_release_3,
      stories.grow_magia,
      stories.grow_awake_1,
      stories.grow_awake_2,
      stories.grow_awake_3,
    ],
  },
  {
    title: "ホーム",
    stories: [
      stories.greet_first,
      stories.greet_morning,
      stories.greet_day,
      stories.greet_evening,
      stories.greet_night,
      stories.greet,
      stories.greet_ap,
      stories.greet_bp,
      stories.talk_1,
      stories.talk_2,
      stories.talk_3,
      stories.talk_4,
      stories.talk_5,
      stories.talk_6,
      stories.talk_7,
      stories.talk_8,
      stories.talk_9,
    ],
  },
  {
    title: "クエスト",
    stories: [
      stories.battle_start,
      stories.battle_win_1,
      stories.battle_win_2,
      stories.battle_win_3,
    ],
  },
] as const;

export function getStoryId(
  _scenarioId: string,
  scenario: Scenario,
  storyKey: keyof typeof stories,
) {
  const intro2Index =
    [39, 43].find((index) =>
      scenario.story?.[`group_${index}`]?.[0]?.chara?.[0].voice?.endsWith("_02")
    ) ?? 2;
  let index;
  if (storyKey === "intro_2") {
    index = intro2Index;
  } else {
    const patternIndex = storyMap[storyKey];
    if (patternIndex !== undefined) {
      index = patternIndex >= 2 && patternIndex <= intro2Index
        ? patternIndex - 1
        : patternIndex;
    }
  }
  return index !== undefined ? `group_${index}` : undefined;
}

const storyMap = {
  intro_1: 1,
  intro_2: 2,
  episode_1: 3,
  episode_2: 4,
  episode_3: 5,
  grow: 6,
  grow_max: 7,
  grow_episode: 8,
  grow_release_1: 9,
  grow_release_2: 10,
  grow_release_3: 11,
  grow_magia: 12,
  grow_awake_1: 13,
  grow_awake_2: 14,
  grow_awake_3: 15,
  grow_awake_4: 16,
  greet_first: 17,
  greet_morning: 18,
  greet_day: 19,
  greet_evening: 20,
  greet_night: 21,
  greet: 22,
  greet_ap: 23,
  greet_bp: 24,
  talk_10: 25,
  talk_1: 26,
  talk_2: 27,
  talk_3: 28,
  talk_4: 29,
  talk_5: 30,
  talk_6: 31,
  talk_7: 32,
  talk_8: 33,
  talk_9: 34,
  battle_start: 35,
  battle_win_1: 36,
  battle_win_2: 37,
  battle_win_3: 38,
  battle_win_4: 39,
  magia_1: 40,
  magia_2: 41,
  magia_3: 42,
  magia_4: 43,
} as { readonly [x in keyof typeof stories]?: number };
