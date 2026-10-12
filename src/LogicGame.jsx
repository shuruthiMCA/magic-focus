import QuizGame from "./QuizGame";

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeSequence() {
  const type = rand(0, 4);

  if (type === 0) {
    const start = rand(2, 20);
    const step = rand(2, 9);
    const terms = [0, 1, 2, 3, 4, 5].map((k) => start + step * k);

    return { terms, rule: `Add ${step} each time` };
  }

  if (type === 1) {
    const start = rand(1, 5);
    const ratio = rand(2, 3);
    const terms = [0, 1, 2, 3, 4].map((k) => start * ratio ** k);

    return { terms, rule: `Multiply by ${ratio} each time` };
  }

  if (type === 2) {
    const start = rand(1, 6);
    const terms = [0, 1, 2, 3, 4, 5].map((k) => (start + k) ** 2);

    return { terms, rule: "These are square numbers" };
  }

  if (type === 3) {
    const start = rand(2, 15);
    const a = rand(2, 6);
    const b = rand(7, 12);
    const terms = [start];

    for (let k = 0; k < 5; k++) {
      terms.push(terms[k] + (k % 2 === 0 ? a : b));
    }

    return { terms, rule: `Add ${a}, then add ${b}, again and again` };
  }

  const first = rand(1, 5);
  const second = rand(1, 5);
  const terms = [first, second];

  for (let k = 2; k < 6; k++) {
    terms.push(terms[k - 1] + terms[k - 2]);
  }

  return { terms, rule: "Each number is the sum of the two before it" };
}

function makeQuestion() {
  const { terms, rule } = makeSequence();
  const answer = terms[terms.length - 1];
  const shown = terms.slice(0, -1);

  const options = new Set([answer]);

  while (options.size < 4) {
    const wrong = answer + rand(1, 8) * (Math.random() < 0.5 ? -1 : 1);

    if (wrong > 0) options.add(wrong);
  }

  return {
    text: `${shown.join(", ")}, ?`,
    answer,
    rule,
    options: [...options].sort(() => Math.random() - 0.5),
  };
}

function LogicGame({ onWin, onClose }) {
  return (
    <QuizGame
      title="🧠 LOGIC PATTERNS"
      makeQuestion={makeQuestion}
      onWin={onWin}
      onClose={onClose}
    />
  );
}

export default LogicGame;