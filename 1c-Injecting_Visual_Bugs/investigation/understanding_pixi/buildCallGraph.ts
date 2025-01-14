import * as ts from "typescript";
import * as fs from 'fs';
import * as path from 'path';

class CallGraph {
    private nodes: Set<string>;
    private edges: Map<string, Set<string>>;

    constructor() {
        this.nodes = new Set();
        this.edges = new Map();
    }

    addNode(node: string): void {
        this.nodes.add(node);
    }

    addEdge(from: string, to: string): void {
        if (!this.edges.has(from)) {
            this.edges.set(from, new Set());
        }
        this.edges.get(from)!.add(to);
    }

    saveToFile(filePath: string): void {
        const graphData = {
            nodes: Array.from(this.nodes),
            edges: Array.from(this.edges.entries()).reduce((acc, [key, val]) => ({
                ...acc,
                [key]: Array.from(val)
            }), {})
        };

        fs.writeFileSync(filePath, JSON.stringify(graphData, null, 2), 'utf-8');
    }

    static loadFromFile(filePath: string): CallGraph {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const graphData = JSON.parse(fileContent);

        const graph = new CallGraph();
        // @ts-ignore
        graphData.nodes.forEach(node => graph.addNode(node));
        Object.entries(graphData.edges).forEach(([from, targets]) => {
            //@ts-ignore
            targets.forEach(target => graph.addEdge(from, target));
        });

        return graph;
    }

    // Additional methods can be added here to work with the graph
}

function visit(node: ts.Node, sourceFile: ts.SourceFile, graph: CallGraph, currentFunctionName: string | null) {
    switch (node.kind) {
        // we will miss certain node definitions like "resolve" and "removeItems" and just fill them in on client-side
        // Not entirely sure why it happens but not yet posing an issue
        case ts.SyntaxKind.FunctionDeclaration:
        case ts.SyntaxKind.MethodDeclaration:
            // Extract function name considering it could be a ComputedPropertyName
            const functionDeclaration = node as ts.FunctionDeclaration | ts.MethodDeclaration;
            let functionName: string | null = null;

            if (functionDeclaration.name) {
                if (ts.isIdentifier(functionDeclaration.name)) {
                    // If the name is an Identifier, we can safely read the 'text' property
                    functionName = functionDeclaration.name.text;
                } else {
                    // If the name is not an Identifier, you need a different handling logic
                    // Depending on your needs, you might choose to ignore these cases or handle them differently
                    // Here, we're setting the functionName to null if it's not a simple identifier
                    functionName = null;
                }
            }

            if (functionName) {
                currentFunctionName = functionName;
                graph.addNode(functionName);
            }
            break;
        case ts.SyntaxKind.CallExpression:
            const callExpr = node as ts.CallExpression;
            const identifier = callExpr.expression as ts.Identifier;
            if (currentFunctionName && identifier && ts.isIdentifier(identifier)) {
                graph.addEdge(currentFunctionName, identifier.text);
            }
            break;
    }

    ts.forEachChild(node, (child) => visit(child, sourceFile, graph, currentFunctionName));
}


function buildCallGraph(fileNames: string[]): CallGraph {
    const graph = new CallGraph();

    const normalizedFileNames = fileNames.map(name => path.resolve(name));

    const program = ts.createProgram(normalizedFileNames, {});

    for (const sourceFile of program.getSourceFiles()) {
        if (!normalizedFileNames.includes(sourceFile.fileName)) {
            // console.log('skipping', sourceFile.fileName)
            continue;
        }

        // console.log('processing', sourceFile.fileName)

        ts.forEachChild(sourceFile, (node) => {
            visit(node, sourceFile, graph, null);
        });
    }

    return graph;
}

function readFilePaths(filePath: string, rootPath: string): string[] {
    // Read the file synchronously, line by line
    // Each line in the file is assumed to be a path to a file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const filePaths = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(relativePath => `${rootPath}/${relativePath}`);  // Append the root path to each file path
    return filePaths;
}

// Run the script
const rootPathOfPixiFiles = '1c-Injecting_Visual_Bugs/investigation/wiki/benchmark/apps/pixijs/pixijs';
const glFiles = readFilePaths('Data/1c-Injecting_Visual_Bugs/investigation/files.txt', rootPathOfPixiFiles);

console.log(glFiles)

const callGraph = buildCallGraph(glFiles);

// console.log(callGraph);
callGraph.saveToFile('Data/1c-Injecting_Visual_Bugs/investigation/callGraph.json');