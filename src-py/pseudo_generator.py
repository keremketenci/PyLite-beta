import re
import sys

conversion_rules = {
    "import": "IMPORT",
    "if": "IF",
    "else:": "ELSE:",
    "elif": "ELSEIF",
    "for": "FOR",
    "=": "TO",
    "==": "EQUALS",
    "while": "WHILE",
    "until": "UNTIL",
    "class": "CLASS",
    "def": "FUNCTION",
    "except:": "EXCEPT:",
    "try:": "TRY:",
    "pass": "PASS",
    "in": "IN",
    "and": "AND",
    "or": "OR",
    "not": "NOT",
    "is": "IS",
    "True": "TRUE",
    "False": "FALSE",
    "None": "NONE"
}

prefix_conversion_rules = {
    "=": "SET ", 
}

privileged_conversion_rules = {
    "return": "RETURN", 
    "input": "INPUT"
}

def l2pseudo(to_pseudo):
    for line_index, line in enumerate(to_pseudo):
        stripped_line = line.strip()
        indent = re.match(r'\s*', line).group()

        if stripped_line.startswith("print"):
            to_pseudo[line_index] = indent + convert_print_statement(stripped_line)
            continue

        words = re.split(r'(\s+)', stripped_line)

        for key, value in prefix_conversion_rules.items():
            if key in words:
                key_index = words.index(key)
                if key_index > 0:
                    words[key_index - 1] = value + words[key_index - 1]
                else:
                    words[key_index + 1] = value + words[key_index + 1]

        for key, value in conversion_rules.items():
            words = [value if word == key else word for word in words]

        for key, value in privileged_conversion_rules.items():
            words = [word.replace(key, value) for word in words]

        for key in prefix_conversion_rules.keys():
            words = [word for word in words if word != key]

        to_pseudo[line_index] = indent + "".join(words).replace("  ", " ")
    return to_pseudo

def convert_print_statement(line):
    content = line[6:-1].strip()

    if content.startswith('f'):
        content = content[1:].strip('"\'')

    pseudo_print = 'PRINT ' + re.sub(r'{(.+?)}', r'"\1"', content)
    return pseudo_print.strip()

def convert_python_code_to_pseudo(code_string):
    file_lines = code_string.split('\n')
    work_file = l2pseudo(file_lines)
    return "\n".join(work_file)

if __name__ == "__main__":
    python_code = sys.argv[1]
    pseudo_code = convert_python_code_to_pseudo(python_code)
    print(pseudo_code)
