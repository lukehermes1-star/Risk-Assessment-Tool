# Risk Workshop Rater

A static workshop tool to rate risk events as **Inherent** or **Residual** using a **5×5 likelihood/consequence matrix**.

## Workshop flow

1. Select rating mode (Inherent or Residual).
2. Select likelihood score (1–5).
3. Select primary driver of risk:
   - Member
   - Reputation
   - Investment | Impact
   - Financial (corporate)
   - Regulatory
   - People
   - Strategic
4. Select consequence level (I–V) based on the chosen driver.
5. Review calculated score and band.

## Scoring model

- `Score = Likelihood × Consequence`
- Bands:
  - Low: 1–5
  - Moderate: 6–10
  - High: 11–15
  - Extreme: 16–25

## Matrix source notes

The consequence descriptions are mapped from the provided consequence table image, normalized into concise workshop-ready text for each driver and level.

## Run locally

Open `index.html` in any browser.


## Likelihood reference included

The app now includes the workshop likelihood reference table:
- Almost Certain: at least once per year
- Likely: approximately once every 3 years
- Possible: approximately once every 10 years
- Unlikely: approximately once every 20 years
- Rare: highly unusual and largely unexpected (e.g. once in 100 years)
