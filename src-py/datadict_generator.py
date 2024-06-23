import symtable
import sys

def get_size(obj, seen=None):
    size = sys.getsizeof(obj)
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0
    seen.add(obj_id)
    if isinstance(obj, dict):
        size += sum(get_size(v, seen) for v in obj.values())
        size += sum(get_size(k, seen) for k in obj.keys())
    elif hasattr(obj, '__dict__'):
        size += get_size(obj.__dict__, seen)
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
        size += sum(get_size(i, seen) for i in obj)
    return size


def get_size_in_kilobytes(obj):
    size_in_bytes = get_size(obj)
    size_in_kb = size_in_bytes / 1024
    return size_in_kb


def analyze_symbol_table(sym_table, code_globals):
    data_dict = {}
    for symbol in sym_table.get_symbols():
        name = symbol.get_name()
        if symbol.is_parameter():
            continue

        if symbol.is_namespace():
            if name in code_globals and isinstance(code_globals[name], type):
                cls = code_globals[name]
                cls_info = {
                    "name": name,
                    "type": "class",
                    "size_kb": get_size_in_kilobytes(cls),
                    "docstring": cls.__doc__,
                    "methods": {},
                    "attributes": {}
                }

                child_table = sym_table.lookup(name).get_namespace()
                for child_symbol in child_table.get_symbols():
                    child_name = child_symbol.get_name()
                    if child_symbol.is_namespace():
                        method = getattr(cls, child_name)
                        cls_info["methods"][child_name] = {
                            "name": child_name,
                            "type": "method",
                            "size_kb": get_size_in_kilobytes(method),
                            "docstring": method.__doc__
                        }
                    else:
                        try:
                            attr = getattr(cls, child_name)
                            cls_info["attributes"][child_name] = {
                                "name": child_name,
                                "type": "attribute",
                                "value": attr,
                                "size_kb": get_size_in_kilobytes(attr),
                            }
                        except AttributeError:
                            cls_info["attributes"][child_name] = {
                                "name": child_name,
                                "type": "attribute",
                                "value": None,
                                "size_kb": None,
                            }
                data_dict[name] = cls_info

            else:
                child_table = sym_table.lookup(name).get_namespace()
                func_info = {
                    "name": name,
                    "type": "function",
                    "size_kb": get_size_in_kilobytes(code_globals.get(name)),
                    "args": child_table.get_parameters(),
                    "docstring": code_globals[name].__doc__ if name in code_globals and callable(code_globals[name]) else None
                }
                data_dict[name] = func_info
                data_dict.update(analyze_symbol_table(child_table, code_globals))
        else:
            try:
                value = eval(name, code_globals)
                var_info = {
                    "name": name,
                    "type": "variable",
                    "value": value,
                    "size_kb": get_size_in_kilobytes(value),
                }
            except (NameError, AttributeError, TypeError):
                var_info = {
                    "name": name,
                    "type": "variable",
                    "value": None,
                    "size_kb": None,
                }
            data_dict[name] = var_info
    return data_dict


def generate_data_dictionary(code):
    sym_table = symtable.symtable(code, '<string>', 'exec')
    code_globals = {}
    exec(code, code_globals)
    data_dict = analyze_symbol_table(sym_table, code_globals)
    return data_dict


code = sys.argv[1]
data_dict = generate_data_dictionary(code)
for item in data_dict.values():
    print(item)
