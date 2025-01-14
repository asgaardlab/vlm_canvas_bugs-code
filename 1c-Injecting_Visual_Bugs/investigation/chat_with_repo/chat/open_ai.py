from openai import OpenAI

GPT_MODEL = "gpt-4-1106-preview"


def chat_completion_request(
    messages, functions=None, function_call=None, model=GPT_MODEL
):
    """
    Wraps client.chat.completions.create() and returns the response text content.
    """
    client = OpenAI()
    print(f"-> Talking to {GPT_MODEL}...")
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        function_call=function_call,
        functions=functions,
        stream=False,
    )
    print(f"<- Got response from {GPT_MODEL}")
    return grab_response_content(response)


def grab_response_content(response):
    attributes = vars(response).keys()
    if "error" in attributes:
        raise Exception(response.error)
    elif "choices" not in attributes:
        raise Exception(f"No choices in response:\n{response}")
    else:
        return response.choices[0].message.content
