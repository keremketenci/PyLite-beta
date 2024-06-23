use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Clone, Debug, Deserialize)]
pub struct SearchQuery {
    pub keyword: String,
    pub directory: String,
    pub match_case: bool,
}

#[derive(Clone, Debug, Serialize)]
pub struct SearchResult {
    pub file_name: String,
    pub line_number: usize,
    pub line_content: String,
}

#[tauri::command]
pub fn find_in_files(query: SearchQuery) -> Vec<SearchResult> {
    let mut results = Vec::new();
    let directory_path = if query.directory.is_empty() {
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("Failed to get parent directory")
            .to_path_buf()
    } else {
        Path::new(&query.directory).to_path_buf()
    };

    if directory_path.is_dir() {
        for entry in directory_path.read_dir().expect("read_dir call failed") {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() && path.ends_with("src") {
                    results.extend(search_in_directory(&path, &query.keyword, query.match_case));
                }
            }
        }
    }
    results
}

#[tauri::command]
pub fn save_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn search_in_directory(directory: &Path, keyword: &str, match_case: bool) -> Vec<SearchResult> {
    let mut results = Vec::new();
    for entry in directory.read_dir().expect("read_dir call failed") {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() {
                let file_results = search_in_file(&path, keyword, match_case);
                results.extend(file_results);
            } else if path.is_dir() {
                results.extend(search_in_directory(&path, keyword, match_case));
            }
        }
    }
    results
}

#[tauri::command]
pub fn search_in_file(file_path: &Path, keyword: &str, match_case: bool) -> Vec<SearchResult> {
    let mut results = Vec::new();
    if let Ok(content) = fs::read_to_string(file_path) {
        for (line_number, line) in content.lines().enumerate() {
            let found = if match_case {
                line.contains(keyword)
            } else {
                line.to_lowercase().contains(&keyword.to_lowercase())
            };
            if found {
                results.push(SearchResult {
                    file_name: file_path.file_name().unwrap().to_string_lossy().to_string(),
                    line_number: line_number + 1,
                    line_content: line.to_string(),
                });
            }
        }
    }
    results
}

// Read file content in given path
#[tauri::command]
pub fn read_file_content(path: String) -> Result<String, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err(format!("File does not exist: {:?}", path));
    }
    if !path.is_file() {
        return Err(format!("Path is not a file: {:?}", path));
    }

    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(_) => Err("Failed to read file content.".to_string()),
    }
}

// Get files and folders in given directory
#[tauri::command]
pub fn get_files_and_subdirs(path: &str) -> Result<Vec<String>, String> {
    let path = Path::new(path);

    if !path.exists() {
        return Err(format!("Directory does not exist: {:?}", path));
    }
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {:?}", path));
    }

    let paths = fs::read_dir(path).unwrap();
    let mut entries = Vec::new();

    for entry in paths {
        let entry = entry.unwrap();
        let metadata = entry.metadata().unwrap();
        let file_name = entry.file_name().into_string().unwrap();

        if metadata.is_dir() {
            entries.push(format!("{}/", file_name));
        } else {
            entries.push(file_name);
        }
    }

    Ok(entries)
}