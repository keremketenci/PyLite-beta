use std::{fs::File, io::Write};
use serde_json::Value;
use tera::Tera;
use std::collections::HashMap;

#[tauri::command]
pub fn generate_tkinter_code(allAttributes: Value) -> Result<(), String> {
    println!("Generating Tkinter code...");
    
    // Load the Tkinter template
    let mut tera = Tera::default();
    tera.add_raw_template("tkinter_template", include_str!("tkinter_template.html"))
        .map_err(|e| {
            println!("Failed to add template: {}", e);
            format!("Failed to add template: {}", e)
        })?;

    let mut context = tera::Context::new();
    context.insert("widgets", &allAttributes);

    // Define custom filters for stripping "px" and converting rgb to hex
    tera.register_filter("strip_px", |value: &tera::Value, _args: &HashMap<String, tera::Value>| -> tera::Result<tera::Value> {
        let s = value.as_str().unwrap_or("");
        Ok(tera::Value::from(s.replace("px", "")))
    });

    tera.register_filter("hex_color", |value: &tera::Value, _args: &HashMap<String, tera::Value>| -> tera::Result<tera::Value> {
        let s = value.as_str().unwrap_or("");
        if s.starts_with("rgb") {
            let rgb_values: Vec<&str> = s[4..s.len()-1].split(", ").collect();
            if rgb_values.len() == 3 {
                let r = u8::from_str_radix(rgb_values[0], 10).unwrap_or(0);
                let g = u8::from_str_radix(rgb_values[1], 10).unwrap_or(0);
                let b = u8::from_str_radix(rgb_values[2], 10).unwrap_or(0);
                return Ok(tera::Value::from(format!("#{:02X}{:02X}{:02X}", r, g, b)));
            }
        }
        Ok(tera::Value::from(s.to_string()))
    });

    let rendered = tera.render("tkinter_template", &context).map_err(|e| {
        println!("Failed to render template: {}", e);
        format!("Failed to render template: {}", e)
    })?;

    // println!("{}", rendered);

    let output_filename = "../src/output.py";
    let mut output_file = File::create(output_filename).map_err(|e| {
        println!("Failed to create file: {}", e);
        format!("Failed to create file: {}", e)
    })?;
    output_file.write_all(rendered.as_bytes()).map_err(|e| {
        println!("Failed to write to file: {}", e);
        format!("Failed to write to file: {}", e)
    })?;

    println!("Tkinter code has been written to {}", output_filename);

    Ok(())
}
