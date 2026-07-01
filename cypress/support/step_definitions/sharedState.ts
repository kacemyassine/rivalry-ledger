// cypress/support/step_definitions/sharedState.ts
export let currentMatchId: string = "";

export function setCurrentMatchId(id: string) {
  currentMatchId = id;
}