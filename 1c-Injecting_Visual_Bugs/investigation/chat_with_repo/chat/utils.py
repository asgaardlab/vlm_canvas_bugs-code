import json


def parse_response_script(response_content):
    try:
        script = response_content.split("```bash")[1].split("```")[0]
        return script
    except Exception as e:
        print(
            "Response does not seem to contain script. Failed to parse. Exception: ", e
        )
        print("Response content:", response_content)
    return ""


def parse_response_json(response_content):
    # case 1: response is just the JSON string
    try:
        content_json = json.loads(response_content)
        return content_json
    except json.JSONDecodeError as e:
        print(
            "Response contains characters other than JSON string. Trying to parse JSON nested in response. Exception: ",
            e,
        )
    # case 2: JSON string is nested in a response string
    try:
        content_json = json.loads(response_content.split("```json")[1].split("```")[0])
        return content_json
    except json.JSONDecodeError as e:
        print(
            "Response does not seem to contain JSON string. Failed to parse. Exception: ",
            e,
        )
        print("Response content:", response_content)
    # case 3: JSON string is missing from response
    return dict()
