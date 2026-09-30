"""
GitHub Repository Creator & File Pusher - No emoji version for Windows terminal
Usage: python push_to_github.py <username> <token>
"""
import sys
import os
import json
import base64
import urllib.request
import urllib.error

def make_request(url, data=None, method="GET", token=""):
    req = urllib.request.Request(url)
    req.add_header("Authorization", "token " + token)
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "MediCare-AI-Pusher")
    if data:
        req.data = json.dumps(data).encode("utf-8")
        req.method = method
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read()), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return json.loads(body) if body else {}, e.code

def push_to_github(username, token):
    print("MediCare AI - GitHub Push Script")
    print("Username : " + username)
    print("Repo     : MediCare-AI\n")

    print("Step 1: Creating GitHub repository 'MediCare-AI'...")
    repo_data = {
        "name": "MediCare-AI",
        "description": "MediCare AI - Smart Medical Report Simplifier | React + FastAPI + AWS Textract + OpenAI GPT-4o-mini + PostgreSQL RDS + DynamoDB",
        "private": False,
        "auto_init": False
    }
    result, status = make_request("https://api.github.com/user/repos", repo_data, "POST", token)
    if status == 201:
        repo_url = result.get("html_url", "")
        print("[OK] Repository created: " + repo_url + "\n")
    elif status == 422:
        print("[INFO] Repository already exists. Continuing to push files...\n")
        repo_url = "https://github.com/" + username + "/MediCare-AI"
    else:
        print("[FAIL] Failed to create repo: " + str(result))
        return

    base_api = "https://api.github.com/repos/" + username + "/MediCare-AI"
    project_root = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(project_root)  # go up to medicare-ai root

    files_to_push = []
    skip_dirs = {"venv", "node_modules", "__pycache__", ".git", "dist", "uploads"}
    skip_extensions = {".pyc", ".db", ".sqlite", ".log", ".zip", ".exe"}
    skip_files = {"mingit.zip"}

    for root, dirs, files in os.walk(project_root):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for fname in files:
            if fname in skip_files:
                continue
            if any(fname.endswith(ext) for ext in skip_extensions):
                continue
            full_path = os.path.join(root, fname)
            rel_path = os.path.relpath(full_path, project_root).replace("\\", "/")
            files_to_push.append((rel_path, full_path))

    print("Step 2: Pushing " + str(len(files_to_push)) + " files to GitHub...\n")
    pushed = 0
    failed = 0

    for rel_path, full_path in files_to_push:
        try:
            with open(full_path, "rb") as f:
                content_bytes = f.read()
            content_b64 = base64.b64encode(content_bytes).decode("utf-8")

            check_url = base_api + "/contents/" + rel_path
            existing, check_status = make_request(check_url, token=token)
            sha = existing.get("sha") if check_status == 200 else None

            file_data = {
                "message": "Add " + rel_path,
                "content": content_b64,
            }
            if sha:
                file_data["sha"] = sha
                file_data["message"] = "Update " + rel_path

            _, push_status = make_request(check_url, file_data, "PUT", token)
            if push_status in (200, 201):
                print("[OK] " + rel_path)
                pushed += 1
            else:
                print("[SKIP] " + rel_path + " (status " + str(push_status) + ")")
                failed += 1
        except Exception as ex:
            print("[ERROR] " + rel_path + " => " + str(ex))
            failed += 1

    print("\n" + "="*60)
    print("Pushed  : " + str(pushed) + " files")
    print("Failed  : " + str(failed) + " files")
    print("\nGitHub Repository URL:")
    print("  " + repo_url)
    print("\nClone Command:")
    print("  git clone https://github.com/" + username + "/MediCare-AI.git")
    print("="*60 + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python push_to_github.py <github_username> <personal_access_token>")
        sys.exit(1)
    username = sys.argv[1]
    token = sys.argv[2]
    push_to_github(username, token)
