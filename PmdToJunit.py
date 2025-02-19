#!/usr/bin/python3

"""
    :brief PMD to JUNIT Converter
    :date 18.02.2025
    :version v1.0.0
    :author Severin Sprenger
"""

import xml.etree.ElementTree as ET
import platform
import sys
import os

pmd_output = ET.parse(sys.argv[1])
pmd_output_root = pmd_output.getroot()

# Scan files that were scanned by pmd
scannedFiles = []

def list_files_recursive(path='.'):
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        if os.path.isdir(full_path):
            list_files_recursive(full_path)
        else:
            if full_path.endswith((".java")): # Add custom file types here
            	scannedFiles.append(full_path.replace(sys.argv[2], "", 1))

list_files_recursive(sys.argv[2])

root = ET.Element("testsuites", name="PMD")
testsuites = ET.SubElement(root, "testsuite", 
    name="PMD", 
    timestamp=pmd_output_root.get("timestamp"), 
    hostname=platform.node(), 
    tests=str(len(scannedFiles)), 
    errors="0", failures="0", skipped="0"
)

errorCount = 0

for files in pmd_output_root.findall("{*}file"):
    testcase = ET.SubElement(testsuites, "testcase", 
        name=str(files.get("name")).replace("./", ""), 
        time="3.0e-05",
        classname="PMD analysis"
    )

    scannedFiles.remove(str(files.get("name")).replace("./", ""))

    while files.findall("{*}violation") != []:
        currentViolation = files.find("{*}violation")

        violType = "Unknown"
        violSeverity = "Unknown"
        violLink = "Not available"

        if currentViolation.get("rule") != None and currentViolation.get("ruleset") != None:
            violType = str(currentViolation.get("ruleset")).replace("\n", "") + "/" + str(currentViolation.get("rule")).replace("\n", "")

        if currentViolation.get("externalInfoUrl") != None:
            violLink = str(currentViolation.get("externalInfoUrl")).replace("\n", "")

        if currentViolation.get("priority") != None:
            violSeverity = str(currentViolation.get("priority")).replace("\n", "")

        errorElement = ET.SubElement(testcase, "error")

        errorElement.text = ""
        errorElement.text += "Type: " + violType + "\n"
        errorElement.text += "Link: " + violLink + "\n"
        errorElement.text += "Severity: " + violSeverity + "\n\n"
        errorElement.text += "Security Alert:\n" + str(currentViolation.text) + "\n\n"
        errorElement.text += "Location:\n"

        for checkViolation in files.findall("{*}violation"):
            if checkViolation.get("rule") == currentViolation.get("rule"):
                if int(checkViolation.get("beginline")) == int(checkViolation.get("endline")):
                    errorElement.text += "- At line " + str(checkViolation.get("beginline")) + "\n"
                else:
                    errorElement.text += "- At lines " + str(checkViolation.get("beginline")) + "-" + str(checkViolation.get("endline")) + "\n"

                errorCount += 1
                files.remove(checkViolation)

testsuites.attrib["errors"] = str(errorCount)

for files in scannedFiles:
    testcase = ET.SubElement(testsuites, "testcase", 
        name=files, 
        time="3.0e-05",
        classname="PMD analysis"
    )

tree = ET.ElementTree(root)
try:
    os.remove(sys.argv[3])
except OSError:
    pass
tree.write(sys.argv[3])
