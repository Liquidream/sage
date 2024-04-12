import { useActorStore } from "@/stores/ActorStore"
import { usePropStore } from "@/stores/PropStore"
import { useSceneStore } from "@/stores/SceneStore"

export class inkCompleter {
  public getCompletions(editor, session, pos, prefix, callback) {
    // There are three possible ways we may want to suggest completions:
    //
    // 1) If we are in a divert or divert target, we should only suggest
    //    target names.
    // 2) If we are in a logic section, we should suggest variables,
    //    targets, (because they can be used as variables) and vocab words.
    //    (because logic can output text)
    // 3) If we are not in either, we should only suggest vocab words.

    const cursorToken = session.getTokenAt(pos.row, pos.column)
    const isCursorInDivert = cursorToken != null ? cursorToken.type.indexOf("divert") != -1 : false
    const isCursorInFlow = cursorToken != null ? cursorToken?.type.indexOf("flow") != -1 : false
    const isCursorInLabel = cursorToken != null ? cursorToken?.type.indexOf(".label") != -1 : false
    const isCursorInLogic = cursorToken != null ? cursorToken?.type.indexOf("logic") != -1 : false

    // Ignore the prefix. ACE will find the most likely words in the list
    // for the prefix automatically.

    let suggestions
    if (isCursorInDivert || isCursorInFlow || isCursorInLabel) {
      suggestions = this.getAllDivertTargetSuggestions()
    } else if (isCursorInLogic) {
      const divertTargetSuggestions = this.getAllDivertTargetSuggestions()
      const variableSuggestions = this.getAllVariableSuggestions()
      const vocabSuggestions = this.getAllVocabSuggestions()
      suggestions = divertTargetSuggestions
        .concat(variableSuggestions)
        .concat(vocabSuggestions)
    } else {
      //suggestions = getAllVocabSuggestions();
    }

    callback(null, suggestions)
  }

  union(sets) {
    const u = new Set()
    for (const set of sets) {
      for (const elem of set) {
        u.add(elem)
      }
    }
    return u
  }

  // Helper function that generates suggestions for all the divert targets
  getAllDivertTargetSuggestions() {
    const sceneStore = useSceneStore()
    const targets = sceneStore.scenes
    const suggestions = []
    for (const target of targets) {
      suggestions.push({
        caption: target.name,
        value: target.id,
        meta: "Scene",
      })
    }
    return suggestions
  }

  // Helper function that generates suggestions for all the variables
  getAllVariableSuggestions() {
    const propStore = usePropStore()
    const variables = propStore.props
    const suggestions = []
    for (const variable of variables) {
      suggestions.push({
        caption: variable.name,
        value: variable.id,
        meta: "Prop",
      })
    }
    return suggestions
  }

  // Helper function that generates suggestions for all the vocabulary
  getAllVocabSuggestions() {
    const actorStore = useActorStore()
    const vocabWords = actorStore.actors
    const suggestions = []
    for (const vocabWord of vocabWords) {
      suggestions.push({
        caption: vocabWord.name,
        value: vocabWord.id,
        meta: "Actor",
      })
    }
    return suggestions
  }
}
