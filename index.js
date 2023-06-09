const $status = document.querySelector("#status");
const $goal = document.querySelector("#goal");
const $otherInput = document.querySelector("#other");
const $askButton = document.querySelector("#ask-button");
const $aiCommentary = document.querySelector("#ai-commentary");
const $statusOther = Object.assign(document.createElement(`div`), {
  innerHTML: `
<div id="status-other" class="flex">
  <button id="status-add" class="mr-3">
      <ion-icon name="add" style="color: indigo; font-size: 1.5rem"></ion-icon>
  </button>
  <span class="text-gray-700 w-full">
      <input type="text" name="status" id="status-other-input"
          class="p-2 bg-slate-200 rounded-md w-full" placeholder="add other status">
  </span>
</div>
  `,
});
const $goalOther = Object.assign(document.createElement(`div`), {
  innerHTML: `
<div id="goal-other" class="flex">
  <label for="goal" class="mr-3">
      <input type="radio" name="goal" class="form-radio text-indigo-600 h-5 w-5">
  </label>
  <span class="text-gray-700 w-full">
      <input type="text" name="goal-other" id="goal-other-input"
          class="p-2 bg-slate-200 rounded-md w-full" placeholder="goal other">
  </span>
<div>
`,
});

// openAI API
const URL = `https://estsoft-openai-api.jejucodingcamp.workers.dev/`;

let statusListGlobal = ["우울함", "불안함", "산만함", "피곤함"];
let goalListGlobal = ["생기를 되찾기", "깊은 휴식", "우울감 극복", "집중"];

// SECTION - 질문과 답변 저장
let messagesGlobal = [
  {
    role: "system",
    content: `당신은 명상법의 전문가입니다. 사용자의 현재 정신상태와 달성하고자 하는 목표를 듣고 가장 효과적인 명상법을 추천해 줄 수 있습니다. 명상세션에 가장 잘 어울리는 명상곡도 추천할 수 있습니다.`,
  },
  {
    role: "user",
    content: "명상에 관한 어떤 음악을 추천해 줄 수 있나요?",
  },
  {
    role: "assistant",
    content: `저는 명상음악을 아주 많이 알고 있습니다. 당신의 정신상태와 달성하고자 하는 목표를 토대로 다양한 음악을 선별해드릴 수 있습니다.
    불안한 감정과 잘 어울리는 곡으로는 "Weightless" by Marconi Union, "Unspoken Words" by Max Cooper 등이 있습니다. 부정적인 과거와 불확실한 미래에서 오는 불안감으로부터 현재에 충실하게 해주지요.
    산만한 상태와 잘 어울리는 곡으로는 "Sit Around the Fire" by Jon Hopkins, "Mindful Breathing" by komorebi, Yoga Nidra 등이 있습니다. 명상 가이드에 따라 흐름에 집중하다보면 어느새 들뜬 마음은 가라앉아 차분하고 고요해집니다.
    우울감과 잘 어울리는 앨범으로는 "Fitness: Yoga" by Sol Rising을 추천합니다. 가만히 듣는 것을 넘어 직접 땀을 흘리는 요가와 함께라면 어느새 유연해진 자신의 정신을 바라보게 될 겁니다.
    `,
  },
  {
    role: "user",
    content: "명상법에 대해서도 알려줄 수 있나요?",
  },
  {
    role: "assistant",
    content: `네! 저는 다양한 명상기법을 알고있습니다. 다양한 상황과 목적에 적합한 명상법을 소개시켜드릴 수 있습니다.
    먼저 몸과 정신의 이완이 필요한 경우 Yoga Nidra를 추천합니다. 온 몸 구석구석을 마음의 눈으로 바라보면 숙면을 더욱 효율적으로 할 수 있으며, 짧은 시간에 몸과 마음을 진정시켜 줄 수 있습니다.
    우울감으로부터 빠져나오기 위해선 우리는 생각한 것 이상으로 강하다는 사실을 알 필요가 있습니다. 따라서 인위적인 호흡을 유도하거나 땀을 내는 운동, 빈야사 요가 등 몸을 덥히는 것으로 생기를 되찾을 수 있습니다.
    명상할 시간이 없어도 1분 이내로 빠르게 정상궤도에 오르는 방법을 알고 있습니다. 그것은 바로 호흡을 의식하는 것입니다. 불규칙했던 나의 호흡은 1분이라는 긴 시간동안 어느새 일정한 리듬을 반복하고 있음을 깨닫게 되고 다시 문제해결에 돌입할 수 있게 됩니다.
    머릿속이 생각으로 가득차거나 주변이 산만한 경우에도 명상은 도움이 많이 됩니다. 마음챙김 명상을 통하여 자신을 하나의 큰 도넛이라고 생각해보세요. 모든 생각과 소음이 어떤 의식적인 가공 없이 내 안에 커다란 구멍을 통해 자유롭게 지나가는 상상을 해 보세요.

    자, 이제 당신의 현재 정신상태와 이루고자 하는 목표에 대하여 알려주세요. 제가 두 가지 답변을 바탕으로 명상음악과 명상법에 대하여 안내해드리겠습니다.
    `,
  },
];
//!SECTION

//SECTION - 질문생성
// 사용자의 질문을 객체를 만들어서 push
const createQuestion = (question) => {
  let result = `명상을 하려고 합니다. `;
  if (question["userStatuses"].length > 0) {
    result = result.concat(
      `지금 나의 상태는 [${question["userStatuses"]}]이고, `
    );
  }
  result = result.concat(
    `내가 현재 이루고자 하는 목표는 "${question["goal"]}" 입니다. `
  );

  if (question["other"]) {
    result = result.concat(`또한, ${question["other"]}. `);
  }

  result = result.concat(
    "저에게 필요한 명상음악과 명상법에 대하여 알려주세요."
  );
  return result;
};

// 화면에 답변 그려주는 함수
function printAnswer(answer) {
  $aiCommentary.innerHTML = createAnswerElement(answer);
}

// api 요청보내는 함수
async function apiPost(question) {
  await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ...messagesGlobal,
      { role: "user", content: question },
    ]),
    redirect: "follow",
  })
    .then((res) => res.json())
    .then((res) => {
      printAnswer(res.choices[0].message.content);
    })
    .catch((err) => {
      console.log(err);
    });
}

function queryQuestion() {
  let userStatuses = [...$status.querySelectorAll("input")]
    .filter((box) => box.checked)
    .map((box) => box.value);

  let goal = [...$goal.querySelectorAll("input")]
    .filter((radio) => radio.checked)
    .map((radio) => radio.value);

  let other = $otherInput.value;

  return {
    userStatuses: userStatuses,
    goal: goal,
    other: other,
  };
}
//!SECTION

// SECTION create elements

function createStatusElement(name) {
  return `
<div class="flex">
    <label for="status" class="mr-3">
        <input type="checkbox" name="status" class="form-radio text-indigo-600 h-5 w-5" value="${name}">
    </label>
    <span class="text-gray-700">${name}</span>
</div>
  `;
}

function createGoalElement(name) {
  return `
<div class="flex">
    <label for="goal" class="mr-3">
        <input type="radio" name="goal" class="form-radio text-indigo-600 h-5 w-5" value="${name}">
    </label>
    <span class="text-gray-700">${name}</span>
</div>
  `;
}

function createAnswerElement(answer) {
  answer = String(answer).split("\n");
  let ret = `<div class="flex flex-col gap-2">`;
  for (let para of answer) {
    ret = ret.concat(`<div>${para}</div>`);
  }
  ret.concat("</div>");

  return ret;
}

// reset prompt with list
function setHtmlWith(list, createElementCallback) {
  let result = "";
  for (let name of list) {
    let html = createElementCallback(name);
    result = result.concat(html);
  }
  return result;
}
// !SECTION

//SECTION - INITIALISE
$status.innerHTML = setHtmlWith(statusListGlobal, createStatusElement);
$status.appendChild($statusOther);
$goal.innerHTML = setHtmlWith(goalListGlobal, createGoalElement);
$goal.appendChild($goalOther);

//SECTION - event listeners
const $statusAddBtn = document.querySelector("#status-add");
const $goalOtherInput = document.querySelector("#goal-other-input");
const $statusOtherInput = document.querySelector("#status-other-input");

$askButton.addEventListener("click", (e) => {
  e.preventDefault();
  let question = createQuestion(queryQuestion());
  apiPost(question);
});

$statusAddBtn.addEventListener("click", (e) => {
  if ($statusOtherInput.value) {
    statusListGlobal.push($statusOtherInput.value);
    $statusOtherInput.value = null;
    $status.innerHTML = setHtmlWith(statusListGlobal, createStatusElement);
    $status.appendChild($statusOther);
  }
});

$goalOtherInput.addEventListener("change", (e) => {
  $goalOther
    .querySelector("input")
    .setAttribute("value", $goalOtherInput.value);
});
//!SECTION
//!SECTION
