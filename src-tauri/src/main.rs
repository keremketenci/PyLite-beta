// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(non_snake_case)]

mod file;
mod designer;

use which::which;
use std::process::Command;

#[tauri::command]
fn get_python_version() -> String {
    let output = Command::new("python")
        .arg("--version")
        .output()
        .expect("Failed to execute command");

    let version = String::from_utf8_lossy(&output.stdout);
    version.to_string()
}

#[tauri::command]
fn get_python_exec_path() -> String {
    let output = Command::new("python")
        .arg("-c")
        .arg("import os, sys; print(sys.executable)")
        .output()
        .expect("Failed to execute command");

    let path = String::from_utf8_lossy(&output.stdout);
    path.to_string()
}

#[tauri::command]
fn get_graphviz_dot_path() -> String {
    match which("dot") {
        Ok(path) => path.to_string_lossy().to_string(),
        Err(e) => format!("Error finding Graphviz dot: {:?}", e),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_python_version,
            get_graphviz_dot_path,
            get_python_exec_path,
            file::get_files_and_subdirs, 
            file::read_file_content,
            file::find_in_files,
            file::save_file,
            designer::generate_tkinter_code
        ])
        .plugin(tauri_plugin_pty::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
