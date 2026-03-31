import importlib.util
from pathlib import Path


def load_module(module_name, relative_file_path):
    base_dir = Path(__file__).resolve().parent
    file_path = base_dir / relative_file_path

    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module {module_name} from {file_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
