import datetime
import re
import sys
from graphviz import Digraph
from subprocess import check_call

filename = ""
current_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

def parse_pseudocode(pseudocode):
    functions = re.findall(r'FUNCTION (\w+)\(.*?\):', pseudocode)
    variables = re.findall(r'SET (\w+) TO', pseudocode)
    return functions, variables

def analyze_code(functions, variables, pseudocode):
    processes = functions
    data_stores = variables
    data_flows = []

    for function in functions:
        for var in variables:
            if re.search(rf'{function}\(.*{var}.*\)', pseudocode):
                data_flows.append((var, function))

            if re.search(rf'SET {var} TO {function}\(.*\)', pseudocode):
                data_flows.append((function, var))

    return processes, data_stores, data_flows

def generate_dfd(processes, data_stores, data_flows, output_path):
    dot = Digraph()

    dot.attr('node', shape='record', style='filled', fillcolor='lightgrey')
    for i, data_store in enumerate(data_stores):
        dot.node(f'ds{i}', label=f"<f0> D{i + 1}|<f1> {data_store}")

    dot.attr('node', shape='Mrecord', style='filled', fillcolor='lightblue')
    for i, process in enumerate(processes):
        dot.node(f'p{i}', label=f"{{<f0> {i + 1}.0|<f1> {process}}}", shape='Mrecord')

    for data_flow in data_flows:
        source = data_flow[0]
        target = data_flow[1]

        source_node = None
        target_node = None

        for i, data_store in enumerate(data_stores):
            if source == data_store:
                source_node = f'ds{i}:f0'
            if target == data_store:
                target_node = f'ds{i}:f0'

        for i, process in enumerate(processes):
            if source == process:
                source_node = f'p{i}:f0'
            if target == process:
                target_node = f'p{i}:f0'

        if source_node and target_node:
            dot.edge(source_node, target_node)

    filename = output_path + "\\output" + current_time + ".dot"
    dot.render(filename=filename, format='png', view=True)

def main():
    pseudocode = sys.argv[1]
    output_dot_path = sys.argv[2]
    dot_sys_path = sys.argv[3]

    functions, variables = parse_pseudocode(pseudocode)
    processes, data_stores, data_flows = analyze_code(functions, variables, pseudocode)
    generate_dfd(processes, data_stores, data_flows, output_dot_path)

    output_image_path = output_dot_path + "\\output" + current_time + ".png"
    check_call([dot_sys_path,'-Tpng', filename,'-o', output_image_path])

if __name__ == "__main__":
    main()
