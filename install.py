import os
import json
import requests
import click


def read_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def resolve_file_path(file_reference, directory):
    if isinstance(file_reference, str) and file_reference.startswith("file:///"):
        return os.path.join(directory, file_reference[8:])
    return file_reference


def read_file_if_exists(file_path):
    if os.path.exists(file_path):
        return read_file(file_path)
    return None


def recompose_assistant(directory):
    config_path = os.path.join(directory, "assistant_config.json")

    if not os.path.exists(config_path):
        raise FileNotFoundError(f"assistant_config.json not found in {directory}")

    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Recompose system prompt
    system_message = next(
        (msg for msg in data["model"]["messages"] if msg["role"] == "system"), None
    )
    if system_message:
        system_message["content"] = (
            read_file_if_exists(resolve_file_path(system_message["content"], directory))
            or system_message["content"]
        )

    # Recompose firstMessage
    if "firstMessage" in data:
        data["firstMessage"] = (
            read_file_if_exists(resolve_file_path(data["firstMessage"], directory))
            or data["firstMessage"]
        )

    # Recompose analysisPlan components
    if "analysisPlan" in data:
        analysis_plan = data["analysisPlan"]

        for key in ["summaryPrompt", "structuredDataPrompt", "successEvaluationPrompt"]:
            if key in analysis_plan:
                analysis_plan[key] = (
                    read_file_if_exists(
                        resolve_file_path(analysis_plan[key], directory)
                    )
                    or analysis_plan[key]
                )

        if "structuredDataSchema" in analysis_plan:
            schema_path = resolve_file_path(
                analysis_plan["structuredDataSchema"], directory
            )
            if os.path.exists(schema_path):
                with open(schema_path, "r", encoding="utf-8") as f:
                    analysis_plan["structuredDataSchema"] = json.load(f)

    return data


def create_assistant(assistant_data, api_key):
    url = "https://api.vapi.ai/assistant"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    try:
        response = requests.post(url, headers=headers, json=assistant_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating assistant: {e}")
        if e.response:
            print(f"Response details: {e.response.text}")
        raise SystemExit(1)


@click.command()
@click.option("--api-key", prompt=True, hide_input=True, help="Your Vapi API key")
@click.option(
    "--directory", default="vapi", help="Directory containing assistant components"
)
def main(api_key, directory):
    """
    Recompose and create a Vapi assistant from components in the specified directory.
    """
    try:
        assistant_data = recompose_assistant(directory)
        created_assistant = create_assistant(assistant_data, api_key)
        print(
            f"Assistant created successfully. Assistant ID: {created_assistant['id']}"
        )
    except FileNotFoundError as e:
        print(f"Error: {e}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
