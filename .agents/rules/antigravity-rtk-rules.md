plugins:
  - name: obey
    hooks:
      PreToolUse:
        block_commands:
          - command: "grep"
            condition: "execution_count > 1"
            action: "intercept"
            message: "Test limit reached. Halt and open PR."
          - command: "Select-String"
            condition: "execution_count > 1"
            action: "intercept"
            message: "Test limit reached. Halt and open PR."
          - command: "cat"
            condition: "execution_count > 1"
            action: "intercept"
            message: "Test limit reached. Halt and open PR."
          - command: "type"
            condition: "execution_count > 1"
            action: "intercept"
            message: "Test limit reached. Halt and open PR."
        block_tools:
          - tool: "view_file"
            condition: "target_file_contains: '.log' AND execution_count > 1"
            action: "intercept"
            message: "Test limit reached. Halt and open PR."
