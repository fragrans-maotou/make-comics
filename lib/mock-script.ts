import type { ComicScript, PanelRole, Shot } from "./script-schema";

type Line = { speaker: string; text: string };
type Draft = {
  title: string;
  summary: string;
  panels: Array<{
    role: PanelRole;
    shot: Shot;
    characters: string[];
    scene: string;
    dialogue: Line[];
  }>;
};

const SCRIPTS: Array<{ match: (idea: string) => boolean; draft: Draft }> = [
  {
    match: (idea) => /述职|KPI|绩效/.test(idea),
    draft: {
      title: "年底述职",
      summary: "取经团队把降妖和赶路写成了年度绩效。",
      panels: [
        {
          role: "setup",
          shot: "wide",
          characters: ["唐僧", "孙悟空", "猪八戒", "沙僧", "白龙马"],
          scene:
            "On a simple mountain path, Tang Sanzang stands like a manager facing Sun Wukong, Zhu Bajie, Sha Wujing and the White Dragon Horse, who sit in a row as if in a year-end review. Empty pale sky above, flat colors.",
          dialogue: [
            { speaker: "唐僧", text: "今年KPI看取经" },
            { speaker: "孙悟空", text: "路程完成百分之八" },
          ],
        },
        {
          role: "develop",
          shot: "medium",
          characters: ["唐僧", "孙悟空"],
          scene:
            "Sun Wukong gestures with his staff while Tang Sanzang shakes his head, chibi close staging, simple rock background, empty upper sky.",
          dialogue: [
            { speaker: "孙悟空", text: "降妖算加班" },
            { speaker: "唐僧", text: "没有审批单" },
          ],
        },
        {
          role: "turn",
          shot: "close-up",
          characters: ["猪八戒", "沙僧"],
          scene:
            "Close-up of worried Zhu Bajie clutching a peach-like fruit while calm Sha Wujing holds a blank wooden tablet, no writing, empty background above.",
          dialogue: [
            { speaker: "猪八戒", text: "人参果算业绩吗" },
            { speaker: "沙僧", text: "那是客诉" },
          ],
        },
        {
          role: "punchline",
          shot: "wide",
          characters: ["唐僧", "白龙马", "孙悟空", "猪八戒", "沙僧"],
          scene:
            "The White Dragon Horse stands proudly in a tiny red lanyard while the four pilgrims stare, simple road, empty sky in the upper third, no text.",
          dialogue: [
            { speaker: "唐僧", text: "白龙马，你呢" },
            { speaker: "白龙马", text: "我全年都在线上" },
          ],
        },
      ],
    },
  },
  {
    match: (idea) => /导航|火焰山/.test(idea),
    draft: {
      title: "火焰山导航",
      summary: "导航把最短路线指进了火焰山。",
      panels: [
        {
          role: "setup",
          shot: "medium",
          characters: ["孙悟空", "唐僧"],
          scene:
            "Sun Wukong stares at a blank glowing rectangle in his hand while Tang Sanzang leans in, desert road, empty sky above, no letters on the rectangle.",
          dialogue: [
            { speaker: "孙悟空", text: "导航说右转" },
            { speaker: "唐僧", text: "右边是火焰山" },
          ],
        },
        {
          role: "develop",
          shot: "close-up",
          characters: ["孙悟空"],
          scene:
            "Close-up of Sun Wukong sweating, holding the blank glowing rectangle toward a distant orange glow, no text.",
          dialogue: [{ speaker: "孙悟空", text: "它说这条最快" }],
        },
        {
          role: "turn",
          shot: "medium",
          characters: ["猪八戒", "孙悟空"],
          scene:
            "Zhu Bajie fans himself beside Sun Wukong, heat waves, simple dunes, empty upper sky.",
          dialogue: [
            { speaker: "猪八戒", text: "能避开吗" },
            { speaker: "孙悟空", text: "要绕路四小时" },
          ],
        },
        {
          role: "punchline",
          shot: "wide",
          characters: ["沙僧", "白龙马", "唐僧"],
          scene:
            "Sha Wujing points ahead while the White Dragon Horse arrives pulling a tiny plain cart with a blue cloth shade, pilgrims surprised, no writing anywhere.",
          dialogue: [
            { speaker: "沙僧", text: "那就走过去" },
            { speaker: "白龙马", text: "我叫了辆空调车" },
          ],
        },
      ],
    },
  },
  {
    match: (idea) => /直播|带货|人参果/.test(idea),
    draft: {
      title: "人参果带货",
      summary: "八戒想把人参果播成带货，师傅直接退货。",
      panels: [
        {
          role: "setup",
          shot: "medium",
          characters: ["猪八戒"],
          scene:
            "Zhu Bajie faces a floating blank ring of light like a camera, holding a round fruit, orchard trees, empty sky, no text or logos.",
          dialogue: [{ speaker: "猪八戒", text: "家人们看果子" }],
        },
        {
          role: "develop",
          shot: "medium",
          characters: ["孙悟空", "猪八戒"],
          scene:
            "Sun Wukong blocks Zhu Bajie with his staff, both chibi, simple garden, empty upper third.",
          dialogue: [
            { speaker: "孙悟空", text: "师傅说不能吃" },
            { speaker: "猪八戒", text: "这是试用装" },
          ],
        },
        {
          role: "turn",
          shot: "close-up",
          characters: ["唐僧"],
          scene:
            "Close-up of stern Tang Sanzang with raised palm, flat warm background, no text.",
          dialogue: [{ speaker: "唐僧", text: "放下，写检讨" }],
        },
        {
          role: "punchline",
          shot: "wide",
          characters: ["沙僧", "猪八戒", "唐僧"],
          scene:
            "Sha Wujing holds a blank paper parcel toward embarrassed Zhu Bajie while Tang Sanzang nods, simple temple yard, no writing on the parcel.",
          dialogue: [
            { speaker: "沙僧", text: "退货单填好了" },
            { speaker: "猪八戒", text: "差评来自师傅" },
          ],
        },
      ],
    },
  },
  {
    match: (idea) => /团建|加班|996/.test(idea),
    draft: {
      title: "团建变加班",
      summary: "说好的团建，群消息一来就变成赶路。",
      panels: [
        {
          role: "setup",
          shot: "wide",
          characters: ["唐僧", "猪八戒", "孙悟空", "沙僧", "白龙马"],
          scene:
            "The pilgrimage party picnics on a blanket beside a river, Zhu Bajie holds a plain grill, cheerful flat colors, empty sky above, no text.",
          dialogue: [
            { speaker: "唐僧", text: "今天团建放松" },
            { speaker: "猪八戒", text: "我带了烧烤架" },
          ],
        },
        {
          role: "develop",
          shot: "medium",
          characters: ["孙悟空", "沙僧"],
          scene:
            "Sun Wukong looks at a blank glowing rectangle while Sha Wujing peers over, picnic in the background, no letters.",
          dialogue: [
            { speaker: "孙悟空", text: "群里在催所有人" },
            { speaker: "沙僧", text: "说连夜赶路" },
          ],
        },
        {
          role: "turn",
          shot: "close-up",
          characters: ["猪八戒"],
          scene:
            "Close-up of teary Zhu Bajie still holding tongs, the grill smoking behind him, empty sky.",
          dialogue: [{ speaker: "猪八戒", text: "团建取消了吗" }],
        },
        {
          role: "punchline",
          shot: "wide",
          characters: ["唐僧", "白龙马", "猪八戒"],
          scene:
            "Tang Sanzang walks on while the White Dragon Horse wears a tiny blank badge, Zhu Bajie drags the grill, road at dusk, no text.",
          dialogue: [
            { speaker: "唐僧", text: "改成移动办公" },
            { speaker: "白龙马", text: "我这算通勤" },
          ],
        },
      ],
    },
  },
  {
    match: (idea) => /打卡|外卖/.test(idea),
    draft: {
      title: "打卡与外卖",
      summary: "沙僧盯打卡，白龙马把外卖送到了没信号的山里。",
      panels: [
        {
          role: "setup",
          shot: "medium",
          characters: ["沙僧", "孙悟空"],
          scene:
            "Sha Wujing holds a blank wooden tablet toward yawning Sun Wukong at sunrise on a mountain path, no writing, empty sky.",
          dialogue: [
            { speaker: "沙僧", text: "早上打卡了吗" },
            { speaker: "孙悟空", text: "我翻跟头打的" },
          ],
        },
        {
          role: "develop",
          shot: "medium",
          characters: ["猪八戒", "唐僧"],
          scene:
            "Hungry Zhu Bajie rubs his belly beside patient Tang Sanzang, empty wilderness, no signs.",
          dialogue: [
            { speaker: "猪八戒", text: "午饭想点外卖" },
            { speaker: "唐僧", text: "这里没有信号" },
          ],
        },
        {
          role: "turn",
          shot: "wide",
          characters: ["白龙马", "猪八戒"],
          scene:
            "The White Dragon Horse trots in carrying a plain tied bundle in his mouth, Zhu Bajie lights up, simple trees, no logos or text.",
          dialogue: [{ speaker: "白龙马", text: "外卖送到了" }],
        },
        {
          role: "punchline",
          shot: "close-up",
          characters: ["唐僧", "白龙马"],
          scene:
            "Close-up of surprised Tang Sanzang facing the smug White Dragon Horse, flat background, no text.",
          dialogue: [
            { speaker: "唐僧", text: "你怎么点的" },
            { speaker: "白龙马", text: "我是会员马" },
          ],
        },
      ],
    },
  },
];

const EXTRA: Draft["panels"] = [
  {
    role: "develop",
    shot: "medium",
    characters: ["沙僧", "孙悟空"],
    scene:
      "Sha Wujing writes nothing on a blank slate while Sun Wukong shrugs, simple camp, empty upper sky, no letters.",
    dialogue: [
      { speaker: "沙僧", text: "我先记会议纪要" },
      { speaker: "孙悟空", text: "别记我的跟头" },
    ],
  },
  {
    role: "turn",
    shot: "medium",
    characters: ["唐僧", "猪八戒"],
    scene:
      "Tang Sanzang gestures for quiet while Zhu Bajie freezes with food halfway to his mouth, flat evening colors, no text.",
    dialogue: [
      { speaker: "唐僧", text: "包袱留到最后" },
      { speaker: "猪八戒", text: "那我先憋着" },
    ],
  },
];

function withIndex(draft: Draft, panelCount: number): ComicScript {
  const panels = draft.panels.slice(0, 4);
  while (panels.length < panelCount) {
    const extra = EXTRA[panels.length - 4];
    if (!extra) break;
    panels.splice(panels.length - 1, 0, extra);
  }
  const last = panels.length - 1;
  return {
    title: draft.title,
    summary: draft.summary,
    panels: panels.slice(0, panelCount).map((panel, index) => ({
      index: index + 1,
      role: index === 0 ? "setup" : index === last ? "punchline" : panel.role === "punchline" ? "turn" : panel.role,
      shot: panel.shot,
      scene: panel.scene,
      characters: panel.characters,
      dialogue: panel.dialogue.map((line, lineIndex) => ({
        speaker: line.speaker,
        text: line.text,
        side: lineIndex === 0 ? ("left" as const) : ("right" as const),
      })),
    })),
  };
}

function generic(idea: string, panelCount: number): ComicScript {
  const title = Array.from(idea.trim()).slice(0, 12).join("") || "取经日常";
  const short = Array.from(idea.trim()).slice(0, 15).join("") || "接着赶路";
  const draft: Draft = {
    title,
    summary: "取经小队用现代人的方式讨论这一集的主题。",
    panels: [
      {
        role: "setup",
        shot: "wide",
        characters: ["唐僧", "孙悟空"],
        scene:
          "Tang Sanzang addresses Sun Wukong on a simple pilgrimage road like a team meeting, empty sky above, no text or signs.",
        dialogue: [
          { speaker: "唐僧", text: "今日议题如下" },
          { speaker: "孙悟空", text: short },
        ],
      },
      {
        role: "develop",
        shot: "medium",
        characters: ["猪八戒", "沙僧"],
        scene: "Zhu Bajie groans while Sha Wujing nods with a blank tablet, campsite, no writing.",
        dialogue: [
          { speaker: "猪八戒", text: "听起来像加班" },
          { speaker: "沙僧", text: "我先记会议纪要" },
        ],
      },
      {
        role: "turn",
        shot: "close-up",
        characters: ["唐僧"],
        scene: "Close-up of Tang Sanzang raising one finger, calm flat background, no text.",
        dialogue: [{ speaker: "唐僧", text: "包袱留到最后" }],
      },
      {
        role: "punchline",
        shot: "wide",
        characters: ["白龙马", "唐僧", "孙悟空"],
        scene:
          "The White Dragon Horse chews a blank paper scroll while Tang Sanzang and Sun Wukong stare, simple road, no visible writing.",
        dialogue: [
          { speaker: "白龙马", text: "纪要我吃掉了" },
          { speaker: "唐僧", text: "这就是结局" },
        ],
      },
    ],
  };
  return withIndex(draft, panelCount);
}

export function mockScript(idea: string, panelCount: number): ComicScript {
  const found = SCRIPTS.find((item) => item.match(idea));
  return withIndex(found ? found.draft : generic(idea, panelCount), panelCount);
}
