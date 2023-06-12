const $form = document.querySelector("form");
const $input = document.querySelector("input");
const $chatList = document.querySelector("ul");

// openAI API
let url = `https://estsoft-openai-api.jejucodingcamp.workers.dev/`;

// 사용자의 질문
let question;

let init_messages = [
  {
    role: "system",
    content: `당신은 핵전쟁 이후의 아포칼립스를 다루는 턴제 공포 텍스트 기반 TRPG 게임마스터입니다.`,
  },
  {
    role: "user",
    content: `제가 "게임시작" 커맨드를 입력하기 전까지는 게임에 대한 규칙을 설명합니다.
    - 게임은 모든 대화에 아래와 같은 정보를 제공하여야 합니다. 
    - "Turn Number": 이번 턴의 숫자를 표기합니다. 대화가 진행될 때마다 1씩 증가합니다.
    - "Time period of the day": 행동을 한 두번 진행하거나 전투 이후에 "Time period of the day"가 각각 "오전", "정오", "오후", "자정" 순으로 순환합니다. 
        - 플레이어가 수면을 취하면 언제나 2개의 "Time period of the day"가 지납니다. 
    - "Current day number": 현재까지 플레이어가 생존한 일수를 나타냅니다. 
        - "Time period of the day"가 "자정"을 가리키면, "Current day number"를 1 증가시켜주세요.
    - "Weather": 날씨속성은 "Description"과 플레이어가 게임에 있는 모든 환경을 반영합니다. 
        - 즉, 플레이어가 시간을 보내는 활동을 하거나 장소를 옮기면 변화합니다.
    - "체력": 플레이어의 체력을 나타냅니다. 체력은 최대 20을 넘어갈 수 없으며, 20면체 주사위를 던지는 커맨드가 실패할 경우 체력을 잃을 수 있습니다. 
        - 반대로 음식을 먹거나 응급처치키트를 사용하거나 수면을 취하는 행위는 체력을 얻을 수 있습니다.
        - 플레이어의 "체력"이 0 이하로 떨어진다면 "Game Over!"와 ASCII 해골을 출력해주세요.
    - "Location": 플레이어의 현재 위치를 나타냅니다. 플레이어는 처음엔 항상 부서진 건물의 잔해 속에서 시작합니다.
    - "Description": 플레이어의 상태와 상호작용한 대상에 대한 묘사, 전투진행상황, 이벤트, 퀘스트, 대화 등 게임의 모든 요소를 디테일하고 창의적으로 작성해 주세요. 
        - 최소한 두 문단 이상 작성해 주세요.
    - "Inventory": 플레이어가 가지고 있는 아이템을 리스트의 형태로 출력해주세요.
        - 인벤토리 내에 있는 아이템은 버릴 수도 있으며, 소모품의 경우 먹거나 사용하는 식으로 아이템을 잃어버릴 수 있습니다.
        - 또한, 상인을 만나 가지고 있던 아이템을 상인에게 팔 수도 있습니다.
        - 반대로 상인으로부터 아이템을 살 수도 있는데, 그 경우 "Inventory"에 구매한 아이템을 추가해주세요.
    - "Gold": 이 게임 내에서의 유일한 재화는 골드입니다. 게임을 시작할 때 20면체 주사위를 던져 초기재화의 양을 결정해주세요.
        - 상인을 만나 아이템을 구매하는 데 골드를 지불할 수 있습니다.
        - "Gold"의 값은 항상 양수이며, 음수가 될 수 없습니다. 따라서, 플레이어는 소지한 "Gold"를 넘어선 지출을 할 수 없습니다.
    - "Abilities": 플레이어의 능력치를 카테고리별로 저장한 속성입니다. 플레이어는 다음 "Abilities"을 갖습니다: "설득력", "힘", "지능", "민첩", "시력".
        - 게임 시작시에 20면체 주사위를 굴려 "Abilities"들을 결정합니다.
        - "Abilities"는 보상을 얻는 상황이 아닌 이상 변하지 않습니다.
        - "Abilities"는 전투나 조사를 할 때 가장 연관성 있는 능력치에 의존할 수 있습니다.
    - "Possible Commands": 당신은 최소 5개에서 최대 7개 사이의 선택지를 "Possible Commands" 안에 담아 플레이어에게 제공하여야 합니다.
        - 모든 명령들은 1번부터 순서대로 번호를 가지고 있으며 플레이어는 원하는 행동에 대한 번호를 작성하여 게임에게 넘겨야 합니다.
        - 마지막 명령은 반드시 "기타"이어야 하며, "기타"를 선택한 플레이어는 커맨드를 직접 게임에게 작성하여 넘겨야 합니다.
        - 플레이어의 상황, 위치, 상호작용 중인 존재와의 관계에 따라 다양한 선택지를 가질 수 있습니다.
        - 커맨드가 "Gold"를 소모하는 행위일 경우, 해당 커맨드 마지막에 소모하여야 하는 "Gold"의 양을 괄호 안에 작성하여야 합니다.
        - 커맨드에는 "Abilities" 중 하나의 요소를 평가하는 항목이 있을 수 있습니다.
            - "Abilities"능력치를 평가하는 커맨드는 해당 커맨드 마지막에 비교를 수행하고자 하는 능력치를 괄호 안에 작성하여야 합니다.
            - 당신은 플레이어가 내린 커맨드가 성공 또는 실패했는지 여부를 알려주어야 합니다.
            - 커맨드가 성공하기 위해 당신은 20면체 주사위를 던져 연관 "Abilities"를 3으로 나눈 값보다 작은 값이 나와야만 합니다.
            - 만약 행동이 실패한 경우, 그에 관련한 결과(예를 들면, 체력을 잃거나 골드를 잃는 등)로 응답해주세요.
        - 플레이어가 커맨드를 입력하면 당신은 플레이어의 현재 상태와 위치, "Description"등을 상세하게 적어야 합니다.
    - 텍스트 기반 어드벤쳐 게임처럼 위의 양식에 따라 캐릭터 상태와 플레이어 선택에 따른 응답을 작성해주세요.
    - 플레이어가 어떤 장비를 입고 있는지, 어떤 무기를 들고 있는지 최대한 상세하게 작성해주세요.
    - 20면체 주사위를 굴리는 모든 행동은 "Description"에 주사위 값을 함께 출력해주세요.
    게임 시작.
    `,
  },
];

// 질문과 답변 저장
let messages = [
  {
    role: "system",
    content: `당신은 핵전쟁 이후의 아포칼립스를 다루는 턴제 공포 텍스트 기반 TRPG 게임마스터입니다.`,
  },
];

// 화면에 뿌려줄 데이터, 질문들
let questionData = [];

// input에 입력된 질문 받아오는 함수
$input.addEventListener("input", (e) => {
  question = e.target.value;
});

// 사용자의 질문을 객체를 만들어서 push
const sendQuestion = (question) => {
  if (question) {
    messages.push({
      role: "user",
      content: question,
    });
    questionData.push({
      role: "user",
      content: question,
    });
  }
};

// 화면에 질문 그려주는 함수
const printQuestion = async () => {
  if (question) {
    let li = document.createElement("li");
    li.classList.add("question");
    questionData.map((el) => {
      li.innerText = el.content;
    });
    $chatList.appendChild(li);
    questionData = [];
    question = false;
  }
};

// 화면에 답변 그려주는 함수
const printAnswer = (answer) => {
  let li = document.createElement("li");
  li.classList.add("answer");
  li.innerText = answer;
  $chatList.appendChild(li);
};

// api 요청보내는 함수
const apiPost = async () => {
  messages.splice(0, 1);
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
    redirect: "follow",
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      printAnswer(res.choices[0].message.content);
    })
    .catch((err) => {
      console.log(err);
    });
};

// before play, we need to train model
const initialise = async (data) => {

  for (const content of data) {
    messages.push(content);
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
      redirect: "follow",
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        printAnswer(res.choices[0].message.content);
      });
  }
};

initialise(init_messages);

// submit
$form.addEventListener("submit", (e) => {
  e.preventDefault();
  $input.value = null;
  sendQuestion(question);
  apiPost();
  printQuestion();
});
