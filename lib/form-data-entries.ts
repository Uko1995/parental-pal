export type FormDataEntries = Record<string, string>;

export function formDataToEntries(formData: FormData): FormDataEntries {
  const entries: FormDataEntries = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION_ID")) continue;
    const stringValue = value.toString();
    if (entries[key]) {
      entries[key] = `${entries[key]},${stringValue}`;
    } else {
      entries[key] = stringValue;
    }
  }
  return entries;
}

export function collectFormEntriesFromElement(
  form: HTMLFormElement,
): FormDataEntries {
  const entries = formDataToEntries(new FormData(form));

  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input, select, textarea",
  ).forEach((element) => {
    if (!element.name || element.name.startsWith("$ACTION_ID")) return;

    if (element instanceof HTMLInputElement) {
      if (element.type === "checkbox" || element.type === "radio") {
        if (element.checked) {
          entries[element.name] = element.value;
        }
      } else if (!(element.name in entries)) {
        entries[element.name] = element.value;
      }
    } else if (!(element.name in entries)) {
      entries[element.name] = element.value;
    }
  });

  return entries;
}
