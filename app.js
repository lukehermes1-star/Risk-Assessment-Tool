const modeOptions = document.getElementById("mode-options");
const likelihoodOptions = document.getElementById("likelihood-options");
const likelihoodTableBody = document.getElementById("likelihood-table-body");
const driverOptions = document.getElementById("driver-options");
const consequenceOptions = document.getElementById("consequence-options");
const consequenceHint = document.getElementById("consequence-hint");
const resultSummary = document.getElementById("result-summary");
const resultScore = document.getElementById("result-score");
const resultBand = document.getElementById("result-band");
const resultDetail = document.getElementById("result-detail");
const matrixWrap = document.getElementById("matrix-wrap");
const resetButton = document.getElementById("reset");

const ratingModes = [
  { key: "inherent", label: "Inherent risk" },
  { key: "residual", label: "Residual risk" }
];

const likelihoodScale = [
  {
    value: 5,
    label: "Almost Certain",
    description: "The event is likely to occur at least once per year."
  },
  {
    value: 4,
    label: "Likely",
    description: "The event may occur approximately once every 3 years."
  },
  {
    value: 3,
    label: "Possible",
    description: "The event may occur approximately once every 10 years."
  },
  {
    value: 2,
    label: "Unlikely",
    description: "The event may occur approximately once every 20 years."
  },
  {
    value: 1,
    label: "Rare",
    description: "The event would be highly unusual and largely unexpected (e.g. once in 100 years)."
  }
];

const consequenceLevels = [
  { value: 1, tag: "I", name: "Insignificant" },
  { value: 2, tag: "II", name: "Minor" },
  { value: 3, tag: "III", name: "Moderate" },
  { value: 4, tag: "IV", name: "Major" },
  { value: 5, tag: "V", name: "Severe" }
];

const drivers = [
  {
    key: "member",
    label: "Member",
    levels: [
      "Negligible impact – 0.5% or less of members dissatisfied.",
      "Some members (over 0.5% to 3%) dissatisfied with products/services.",
      "Select members (over 3% to 10%) dissatisfied with products/services.",
      "Large portion of members (over 10% to 30%) dissatisfied or outcomes not met for one year.",
      "Significant portion (over 30%) dissatisfied or outcomes not met for two years."
    ]
  },
  {
    key: "reputation",
    label: "Reputation",
    levels: [
      "Some public criticism with little follow-up impact on confidence.",
      "Adverse short-term concerns impacting confidence.",
      "Public concerns requiring a few months of repair to confidence.",
      "Public concerns requiring best part of a year to repair confidence.",
      "Public outcry / grievances requiring several years of repair to confidence."
    ]
  },
  {
    key: "investment",
    label: "Investment | Impact",
    levels: [
      "Median or higher investment performance relative to peers.",
      "Below median investment performance over a 5-year period.",
      "Bottom quartile performance relative to peers over 5 years.",
      "Deliver poor investment performance first time with limited recovery in 12 months.",
      "Deliver poor investment performance twice consecutively and/or significant IMA breach."
    ]
  },
  {
    key: "financial",
    label: "Financial (corporate)",
    levels: [
      "Less than $25k.",
      "Over $25k to $100k.",
      "Over $100k to $500k.",
      "Over $500k to $1 million.",
      "Over $1 million."
    ]
  },
  {
    key: "regulatory",
    label: "Regulatory",
    levels: [
      "Rectification via managerial action; no regulator engagement.",
      "Rectification via managerial intervention with no/minimal regulator engagement.",
      "Rectification managed with regulator action and reporting.",
      "Increasing/frequent regulator interactions, investigations, onsite engagements.",
      "Regulator intervention/enforcement including restrictions and significant fines."
    ]
  },
  {
    key: "people",
    label: "People",
    levels: [
      "OHS incident requiring first aid; no workdays lost and/or turnover >5%.",
      "WHS injury requiring treatment and up to 5 days off and/or turnover >7.5%.",
      "WHS injury requiring treatment and 6–15 days off and/or turnover >10%.",
      "WHS injury/mental health issue requiring treatment with >15 days off and/or turnover >15%.",
      "Fatality/permanent disability/ill health and/or turnover >20%."
    ]
  },
  {
    key: "strategic",
    label: "Strategic",
    levels: [
      "Progress/status of OKRs unaffected by incident.",
      "One or more OKRs at risk for a quarter and/or one or more metrics behind for a month.",
      "One or more OKRs at risk for a quarter and one or more Health+Hero metrics impacted.",
      "Strategic reprioritisation of initiatives/resources required.",
      "Incident triggers immediate review of relevant strategy."
    ]
  }
];

const state = {
  mode: null,
  likelihood: null,
  driver: null,
  consequence: null
};

function getBand(score) {
  if (score <= 5) return "Low";
  if (score <= 10) return "Moderate";
  if (score <= 15) return "High";
  return "Extreme";
}

function buildButtons(container, items, onSelect, formatter, selectedValue, selectedBy = "key") {
  container.innerHTML = "";
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "button";
    button.textContent = formatter(item, index);

    const currentValue = selectedBy === "value" ? item.value : item.key;
    if (selectedValue !== null && selectedValue === currentValue) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", () => onSelect(item));
    container.appendChild(button);
  });
}

function renderLikelihoodReference() {
  likelihoodTableBody.innerHTML = "";

  likelihoodScale.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${item.label}</td><td>${item.description}</td>`;
    likelihoodTableBody.appendChild(row);
  });
}

function renderModes() {
  buildButtons(
    modeOptions,
    ratingModes,
    (mode) => {
      state.mode = mode;
      renderModes();
      updateResult();
    },
    (item) => item.label,
    state.mode ? state.mode.key : null,
    "key"
  );
}

function renderLikelihood() {
  buildButtons(
    likelihoodOptions,
    likelihoodScale,
    (item) => {
      state.likelihood = item;
      renderLikelihood();
      updateResult();
      renderMatrix();
    },
    (item) => `${item.value}: ${item.label}`,
    state.likelihood ? state.likelihood.value : null,
    "value"
  );
}

function renderDrivers() {
  buildButtons(
    driverOptions,
    drivers,
    (driver) => {
      state.driver = driver;
      state.consequence = null;
      renderDrivers();
      renderConsequences();
      updateResult();
      renderMatrix();
    },
    (item) => item.label,
    state.driver ? state.driver.key : null,
    "key"
  );
}

function renderConsequences() {
  consequenceOptions.innerHTML = "";

  if (!state.driver) {
    consequenceHint.textContent = "Select a primary driver first.";
    return;
  }

  consequenceHint.textContent = `Consequence table for ${state.driver.label}:`;

  consequenceLevels.forEach((level, index) => {
    const item = document.createElement("button");
    item.className = "level-item";
    if (state.consequence && state.consequence.value === level.value) {
      item.classList.add("is-selected");
    }

    item.innerHTML = `
      <span class="level-item__title">${level.tag} — ${level.name} (${level.value})</span>
      <span class="level-item__desc">${state.driver.levels[index]}</span>
    `;

    item.addEventListener("click", () => {
      state.consequence = {
        value: level.value,
        tag: level.tag,
        name: level.name,
        description: state.driver.levels[index]
      };
      renderConsequences();
      updateResult();
      renderMatrix();
    });

    consequenceOptions.appendChild(item);
  });
}

function renderMatrix() {
  const table = document.createElement("table");
  table.className = "matrix";

  const headRow = document.createElement("tr");
  const blank = document.createElement("th");
  blank.textContent = "L × C";
  headRow.appendChild(blank);

  consequenceLevels.forEach((level) => {
    const th = document.createElement("th");
    th.textContent = `${level.tag} (${level.value})`;
    headRow.appendChild(th);
  });

  const thead = document.createElement("thead");
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  likelihoodScale
    .slice()
    .sort((a, b) => a.value - b.value)
    .forEach((likelihood) => {
      const row = document.createElement("tr");
      const label = document.createElement("th");
      label.textContent = `${likelihood.value}`;
      row.appendChild(label);

      consequenceLevels.forEach((consequence) => {
        const td = document.createElement("td");
        const score = likelihood.value * consequence.value;
        td.textContent = String(score);
        td.dataset.band = getBand(score).toLowerCase();

        const selected =
          state.likelihood &&
          state.consequence &&
          state.likelihood.value === likelihood.value &&
          state.consequence.value === consequence.value;

        if (selected) {
          td.classList.add("is-active");
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

  table.appendChild(tbody);
  matrixWrap.innerHTML = "";
  matrixWrap.appendChild(table);
}

function updateResult() {
  if (!state.mode || !state.likelihood || !state.driver || !state.consequence) {
    resultSummary.textContent = "Make your selections to calculate a score.";
    resultScore.textContent = "—";
    resultBand.textContent = "—";
    resultDetail.textContent = "—";
    return;
  }

  const score = state.likelihood.value * state.consequence.value;
  const band = getBand(score);

  resultSummary.textContent = `${state.mode.label}: ${state.driver.label} driver.`;
  resultScore.textContent = `Score: ${score} / 25`;
  resultBand.textContent = `Rating band: ${band}`;
  resultDetail.textContent = `Likelihood ${state.likelihood.value} (${state.likelihood.label}) × Consequence ${state.consequence.tag} (${state.consequence.name}).`;
}

function resetAll() {
  state.mode = null;
  state.likelihood = null;
  state.driver = null;
  state.consequence = null;
  renderLikelihoodReference();
  renderModes();
  renderLikelihood();
  renderDrivers();
  renderConsequences();
  renderMatrix();
  updateResult();
}

resetButton.addEventListener("click", resetAll);

resetAll();
