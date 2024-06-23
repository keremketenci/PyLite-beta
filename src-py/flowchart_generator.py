import sys
from pyflowchart import Flowchart, output_html
import datetime

def generate_flowchart_image(code, output_path):
    current_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = output_path + "\\output" + current_time + ".html"

    generated_flowchart = Flowchart.from_code(code, field="", inner=True, simplify=False, conds_align=False)
    output_html(output_name=filename, field_name='function', flowchart=generated_flowchart.flowchart())

def main():
    input_file_path = sys.argv[1]
    output_image_path = sys.argv[2]

    with open(input_file_path, "r") as file:
        code = file.read()

    generate_flowchart_image(code, output_image_path)

if __name__ == "__main__":
    main()