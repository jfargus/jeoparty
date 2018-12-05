let clues = {
  "key": {
    id: 51426,
    answer: 'Johnny Weissmuller',
    question: 'In a 1932 film what this actor actually says is "Jane! -- Tarzan!  Jane! -- Tarzan!"',
    value: 200,
    airdate: '2003-07-09T12:00:00.000Z',
    created_at: '2014-02-11T23:17:23.583Z',
    updated_at: '2014-02-11T23:17:23.583Z',
    category_id: 6493,
    game_id: null,
    invalid_count: null,
    category: {
      id: 6493,
      title: 'johnny come lately',
      created_at: '2014-02-11T23:17:23.485Z',
      updated_at: '2014-02-11T23:17:23.485Z',
      clues_count: 5
    },
    screen_question: 'IN A 1932 FILM WHAT THIS ACTOR ACTUALLY SAYS IS "JANE! -- TARZAN!  JANE! -- TARZAN!"',
    raw_answer: 'johnnyweissmuller',
    screen_answer: 'johnnyweissmuller'
  }
};

let lastClueRequest = "key";

function formatRawText(original) {
  /*
   */

  let rawAnswer = original.toLowerCase();

  rawAnswer = rawAnswer + " ";

  // HTML tags
  rawAnswer = rawAnswer.replace(/<i>/g, "");
  rawAnswer = rawAnswer.replace("</i>", "");

  // Punctuation
  rawAnswer = rawAnswer.replace(/[.,\/#!$%\^&\*;:"'{}=\-_`~()]/g, " ");
  rawAnswer = rawAnswer.replace(/\s{2,}/g, " ");
  rawAnswer = rawAnswer.replace(String.fromCharCode(92), "");

  // Red words
  rawAnswer = rawAnswer.replace(/and /g, "");
  rawAnswer = rawAnswer.replace(/the /g, "");
  rawAnswer = rawAnswer.replace(/a /g, "");
  rawAnswer = rawAnswer.replace(/an /g, "");

  // Spacing
  rawAnswer = rawAnswer.replace(/ /g, "");

  return (rawAnswer);
}

function evaluateAnswer(answer) {
  /*
   */

  let correctAnswer = clues[lastClueRequest]["raw_answer"];
  let playerAnswer = formatRawText(answer);

  let question = formatRawText(clues[lastClueRequest]["question"]);
  let categoryName = formatRawText(clues[lastClueRequest]["category"]["title"]);

  if (playerAnswer == correctAnswer) {

  } else {
    if (question.includes(playerAnswer) || categoryName.includes(playerAnswer) || answer.length <= 2) {
      return false;
    } else {
      if (correctAnswer.includes(playerAnswer) || playerAnswer.contains(correctAnswer)) {
        return true;
      } else {
        return false;
      }
    }
  }
}

console.log(evaluateAnswer("come"));