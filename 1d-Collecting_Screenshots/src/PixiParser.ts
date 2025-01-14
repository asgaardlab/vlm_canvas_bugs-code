import * as Flatted from 'flatted';
import { readFileAsync } from 'fs-extra-promise';
import { createArrayCsvWriter } from 'csv-writer';
import { 
    Container as PixiContainer,
    // DisplayObject as PixiDisplayObject,
    Sprite as PixiSprite,
    Text as PixiText,
    Graphics as PixiGraphics,
} from 'pixi.js';

// Format of PIXI.Container.vertexData
interface PixiVertexData {
    "0": number | string;
    "1": number | string;
    "2": number | string;
    "3": number | string;
    "4": number | string;
    "5": number | string;
    "6": number | string;
    "7": number | string;
}

// Format of PIXI.Container._bounds
interface PixiBoundsData {
    "minX": number | string;
    "minY": number | string;
    "maxX": number | string;
    "maxY": number | string;
}

// empty values
const EMPTY:string = "";
const ZERO:number = 0;
const ONE:number = 1;
const FALSE:boolean = false;
const NO_TINT:number = 16777215; // 0xFFFFFF as decimal
const EMPTY_VERTEX_DATA:PixiVertexData = {"0": EMPTY, "1": EMPTY, "2": EMPTY, "3": EMPTY, "4": EMPTY, "5": EMPTY, "6": EMPTY, "7": EMPTY};
const EMPTY_BOUNDS_DATA:PixiBoundsData = {"minX": EMPTY, "minY": EMPTY, "maxX": EMPTY, "maxY": EMPTY};

// 1-D vector with value
type Vector = Array<string|number|boolean>;

// 1-D vector with keys and values
type Mapping<K extends string> = Record<K, string|number|boolean>;

// 2-D matrix with a collection of 1-D Vectors
type MatrixVectors = Array<Vector>;

// 2-D matrix with a collection of 1-D Records
type MatrixMappings<K extends string> = Array<Mapping<K>>;

// Index (1-D vector) to represent vector of indices in DataTable
type Index = Array<string|number>;

// Header (1-D vector) to represent column names in DataTableVectors
type Header = Array<string>;

// DataFrame/DataTable/Table... - contains MatrixVectors or MatrixMappings
interface DataTable {
    index: Index;
}

// DataFrame/DataTable/Table... for MatrixVectors - requires header
interface DataTableVectors extends DataTable {
    header: Header;
    matrix: MatrixVectors;
}

// DataFrame/DataTable/Table... for MatrixMappings - has keys, does not require header
interface DataTableMappings<K extends string> extends DataTable {
    matrix: MatrixMappings<K>;
}

// Row major
function makePrepopulatedVector(numLengthOfVector:number): Vector {
    const vector:Vector = [] as Vector;

    for (let count=0; count<numLengthOfVector; count++){
        /**
         * @todo be type aware when initializing rows
         */
        vector.push(EMPTY);

    }

    return vector;
}

// Row major
function makePrepopulatedMapping<K extends string>(listOfColumnNames:Array<K>): Mapping<K> {
    const mapping:Mapping<K> = {} as Mapping<K>;

    for (let count in listOfColumnNames) {
        /**
         * @todo be type aware when initializing rows
         */
        const columnName = listOfColumnNames[count];
        mapping[columnName] = EMPTY;

    }

    return mapping;
}

// Embarrassingly parallel under-the-hood
function makePrepopulatedMatrix<K extends string>(numSizeRows:number, numSizeColumns?:number, listOfColumnNames?:Array<K>): MatrixVectors|MatrixMappings<K> {

    if (typeof listOfColumnNames !== "undefined") {
        return makePrepopulatedMatrixMappings(numSizeRows, listOfColumnNames);

    }

    if (typeof numSizeColumns === "undefined") {
        console.error("Cannot makeMatrix without at least one of: numSizeColumns, listOfColumnNames");
        return ( [[]] as MatrixVectors);

    }

    return makePrepopulatedMatrixVectors(numSizeRows, numSizeColumns);
}

// Embarrassingly parallel under-the-hood
function makePrepopulatedMatrixVectors(numSizeRows:number, numSizeColumns:number): MatrixVectors {

    const matrix:MatrixVectors = [] as MatrixVectors;

    for (let indices_i = 0; indices_i < numSizeRows; indices_i++) {
        const vector:Vector = makePrepopulatedVector(numSizeColumns);
        matrix.push(vector);

    }

    return matrix;
}

// Embarrassingly parallel under-the-hood
function makePrepopulatedMatrixMappings<K extends string>(numSizeRows:number, listOfColumnNames:Array<K>): MatrixMappings<K> {

    const matrix:MatrixMappings<K> = [] as MatrixMappings<K>;
    
    for (let indices_i = 0; indices_i < numSizeRows; indices_i++) {
        const mapping:Mapping<K> = makePrepopulatedMapping(listOfColumnNames);
        matrix.push(mapping);

    }

    return matrix;
}

//
function makeIndex(numLengthOfIndex:number): Index {
    const index:Index = [] as Index;

    for (let indices_i=0; indices_i<numLengthOfIndex; indices_i++){
        index.push(indices_i);

    }

    return index;
}

/**
 * Render order is usually parent -> (1st child -> 1st child ... last child) ... last child
 * Object order can be arranged in Scene Graph with `setChildIndex` and `addChildAt`
 * But this can also be changed with `zIndex` and `sortableChildren`
 * - pre-rendering may also affect order of objects on screen.
 * - may depend on Pixi version (v4,5,6,7,8)
 * https://pixijs.com/8.x/guides/basics/scene-graph
 */
export class PixiParser {
    private readonly __pathBase:string;

    constructor () {
        // not used yet
        this.__pathBase = __dirname;
    }

    /**
     * @param pathInputBzmrFile - path to the input stringified COR in Browser Zipped Mapping References (BZMR) format
     * @param pathOutputCsvFile - path to the output CSV file containing a description of objects in the COR
     */
    public static async makeTable(pathInputBzmrFile: string, pathOutputCsvFile: string) {

        const headerOfTable:Header = [
            "string_type_of_node",
            "string_asset_url",
            "string_asset_src",
            "float_frame_x",
            "float_frame_y",
            "float_frame_width",
            "float_frame_height",
            "bool_is_visible",
            "float_rotation",
            "float_vertex_0_x",
            "float_vertex_0_y",
            "float_vertex_1_x",
            "float_vertex_1_y",
            "float_vertex_2_x",
            "float_vertex_2_y",
            "float_vertex_3_x",
            "float_vertex_3_y",
            "float_bounds_min_x",
            "float_bounds_min_y",
            "float_bounds_max_x",
            "float_bounds_max_y",
            "int_tint_as_decimal",
            "float_alpha_channel"
        ]

        // Blocking read of the Canvas Objects Representation (COR) in Browser Zip Mapped References (BZMR) format .bzmr
        const bzmrCanvasObjectsRepresentation:string = await readFileAsync(pathInputBzmrFile, 'utf8');
        // Parse the Canvas Objects Representation (COR) BZMR into a JavaScript Object (Notation) / JSON format
        const jsonCanvasObjectsRepresentation:PixiContainer = Flatted.parse(bzmrCanvasObjectsRepresentation);
        // Parse the Canvas Objects Representation (COR) JSON into a Table
        const matrixCanvasObjectsRepresentation:MatrixVectors = this.traverseCor(jsonCanvasObjectsRepresentation);
        const indexOfTable:Index = makeIndex(matrixCanvasObjectsRepresentation.length);
        const tableCanvasObjectsRepresentation:DataTableVectors = {
            index: indexOfTable,
            header: headerOfTable,
            matrix: matrixCanvasObjectsRepresentation
        };
        // Save the Canvas Objects Representation (COR) table as a Comma Seperated Values (CSV) file .csv
        this.writeCsv(pathOutputCsvFile, tableCanvasObjectsRepresentation);
    }

    private static traverseCor(root: PixiContainer):MatrixVectors {

        const matrix:MatrixVectors = [] as MatrixVectors;
        const seen = new Set();
        const queue = new Array(root);

        // console.debug(queue);

        while (queue.length > 0) {

            const node = queue.shift();

            if (node == null) {
                continue;
            }

            if (!("children" in node) || ("children" in node && node.children === undefined) || ("children" in node && node.children !== undefined && node.children.length === 0)) {

                // console.debug("FOUND LEAF NODE");

                // extract the data we want for visual testing
                const entry = this.extractEntry(node);

                // console.debug("ENTRY:", entry);

                if (entry !== null) {
                    matrix.push(entry);
    
                }
            };

            if ("children" in node && node?.children !== undefined && node?.children?.length !== undefined && node?.children?.length > 0) {

                // console.debug("CHECKING CHILD NODES")
                // breadth-first search
                node.children.filter((c: any) => {
                    return !seen.has(c);

                }).map((c: any) => {
                    // console.debug("ADDING TO QUEUE");
                    seen.add(c);
                    queue.push(c);

                });
            };
        }
        return matrix;
    }

    private static extractEntry(node: any): Vector | null {

        // PIXI.Text extends PIXI.Sprite so need to capture texts before sprites
        if (node?.text || node?._text) {
            // console.debug("Extracting Text");
            return this.extractPixiText(node);
        }

        if ((node?.texture || node?._texture) && (node?.isSprite || node?._isSprite)) {
            // console.debug("Extracting Sprite");
            return this.extractPixiSprite(node);
        }

        if (node?.geometry || node?._geometry) {
            // console.debug("Extracting Graphics");
            return this.extractPixiGraphics(node);
        }

        return null;
    }

    private static extractPixiSprite(node: PixiSprite): Vector {

        const _node = (node as any);
        const string_type_of_node:string = "PIXI.Sprite";
        const string_asset_url:string = _node?._texture?.baseTexture?.resource?.url || EMPTY;
        const string_asset_src:string = _node?._texture?.baseTexture?.resource?.src || EMPTY;
        const float_frame_x:number = _node?._texture?._frame?.x || ZERO;
        const float_frame_y:number = _node?._texture?._frame?.y || ZERO;
        const float_frame_width:number = _node?._texture?._frame?.width || ZERO;
        const float_frame_height:number = _node?._texture?._frame?.height || ZERO;
        const bool_is_visible:boolean = _node?.visible || FALSE;
        const float_rotation:number = _node?.transform?._rotation || ZERO;
        const int_tint_as_decimal:number = _node?._tint || NO_TINT;
        const float_alpha_channel:number = _node?.alpha || ONE; // TODO replace with .worldAlpha ? https://api.pixijs.io/@pixi/display/PIXI/DisplayObject.html#worldAlpha

        const {
            "0": float_vertex_0_x,
            "1": float_vertex_0_y,
            "2": float_vertex_1_x,
            "3": float_vertex_1_y,
            "4": float_vertex_2_x,
            "5": float_vertex_2_y,
            "6": float_vertex_3_x,
            "7": float_vertex_3_y
        }:PixiVertexData = _node?.vertexData || EMPTY_VERTEX_DATA;

        const {
            "minX": float_bounds_min_x,
            "minY": float_bounds_min_y,
            "maxX": float_bounds_max_x,
            "maxY": float_bounds_max_y
        }:PixiBoundsData = _node?._bounds || EMPTY_BOUNDS_DATA;

        return [
            string_type_of_node,
            string_asset_url,
            string_asset_src,
            float_frame_x,
            float_frame_y,
            float_frame_width,
            float_frame_height,
            bool_is_visible,
            float_rotation,
            float_vertex_0_x,
            float_vertex_0_y,
            float_vertex_1_x,
            float_vertex_1_y,
            float_vertex_2_x,
            float_vertex_2_y,
            float_vertex_3_x,
            float_vertex_3_y,
            float_bounds_min_x,
            float_bounds_min_y,
            float_bounds_max_x,
            float_bounds_max_y,
            int_tint_as_decimal,
            float_alpha_channel
        ];
    };

    private static extractPixiGraphics(node: PixiGraphics): Vector {

        const _node = (node as any);
        const string_type_of_node:string = "PIXI.Graphics";
        const string_asset_url:string = EMPTY;
        const string_asset_src:string = EMPTY;
        const float_frame_x:string = EMPTY;
        const float_frame_y:string = EMPTY;
        const float_frame_width:string = EMPTY;
        const float_frame_height:string = EMPTY;
        const bool_is_visible:boolean = _node?.visible || FALSE;
        const float_rotation:number = _node?.transform?._rotation || ZERO;
        const int_tint_as_decimal:number = _node?._tint || NO_TINT;
        const float_alpha_channel:number = _node?.alpha || ONE; // TODO replace with .worldAlpha ? https://api.pixijs.io/@pixi/display/PIXI/DisplayObject.html#worldAlpha

        const {
            "0": float_vertex_0_x,
            "1": float_vertex_0_y,
            "2": float_vertex_1_x,
            "3": float_vertex_1_y,
            "4": float_vertex_2_x,
            "5": float_vertex_2_y,
            "6": float_vertex_3_x,
            "7": float_vertex_3_y
        }:PixiVertexData = _node?.vertexData || EMPTY_VERTEX_DATA;

        const {
            "minX": float_bounds_min_x,
            "minY": float_bounds_min_y,
            "maxX": float_bounds_max_x,
            "maxY": float_bounds_max_y
        }:PixiBoundsData = _node?._bounds || EMPTY_BOUNDS_DATA;

        return [
            string_type_of_node,
            string_asset_url,
            string_asset_src,
            float_frame_x,
            float_frame_y,
            float_frame_width,
            float_frame_height,
            bool_is_visible,
            float_rotation,
            float_vertex_0_x,
            float_vertex_0_y,
            float_vertex_1_x,
            float_vertex_1_y,
            float_vertex_2_x,
            float_vertex_2_y,
            float_vertex_3_x,
            float_vertex_3_y,
            float_bounds_min_x,
            float_bounds_min_y,
            float_bounds_max_x,
            float_bounds_max_y,
            int_tint_as_decimal,
            float_alpha_channel
        ];
    };

    private static extractPixiText(node: PixiText):Vector {
        const _node = (node as any);
        const string_type_of_node:string = "PIXI.Text";
        const string_asset_url:string = EMPTY;
        const string_asset_src:string = EMPTY;
        const float_frame_x:string = EMPTY;
        const float_frame_y:string = EMPTY;
        const float_frame_width:string = EMPTY;
        const float_frame_height:string = EMPTY;
        const bool_is_visible:boolean = _node?.visible || FALSE;
        const float_rotation:number = _node?.transform?._rotation || ZERO;
        const int_tint_as_decimal:number = _node?._tint || NO_TINT;
        const float_alpha_channel:number = _node?.alpha || ONE; // TODO replace with .worldAlpha ? https://api.pixijs.io/@pixi/display/PIXI/DisplayObject.html#worldAlpha

        const {
            "0": float_vertex_0_x,
            "1": float_vertex_0_y,
            "2": float_vertex_1_x,
            "3": float_vertex_1_y,
            "4": float_vertex_2_x,
            "5": float_vertex_2_y,
            "6": float_vertex_3_x,
            "7": float_vertex_3_y,
        }:PixiVertexData = _node?.vertexData || EMPTY_VERTEX_DATA;

        const {
            "minX": float_bounds_min_x,
            "minY": float_bounds_min_y,
            "maxX": float_bounds_max_x,
            "maxY": float_bounds_max_y
        }:PixiBoundsData = _node?._bounds || EMPTY_BOUNDS_DATA;

        return [
            string_type_of_node,
            string_asset_url,
            string_asset_src,
            float_frame_x,
            float_frame_y,
            float_frame_width,
            float_frame_height,
            bool_is_visible,
            float_rotation,
            float_vertex_0_x,
            float_vertex_0_y,
            float_vertex_1_x,
            float_vertex_1_y,
            float_vertex_2_x,
            float_vertex_2_y,
            float_vertex_3_x,
            float_vertex_3_y,
            float_bounds_min_x,
            float_bounds_min_y,
            float_bounds_max_x,
            float_bounds_max_y,
            int_tint_as_decimal,
            float_alpha_channel
        ];
    };

    private static writeCsv(pathOutCsvFile: string, tableCor: DataTableVectors) {
        const csvWriter = createArrayCsvWriter({
            path: pathOutCsvFile,
            header: tableCor.header
        });

        // console.debug(tableCor.matrix);

        csvWriter.writeRecords(tableCor.matrix).then(() => {
            console.info(`Wrote ${tableCor.matrix.length} records to ${pathOutCsvFile}`);
        });
    }
}
