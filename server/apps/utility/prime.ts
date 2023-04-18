import { HttpStatus } from '@nestjs/common'
import { Model } from 'mongoose'

export async function prime_datatable(parameter: any, model: Model<any>) {
  const first: number = parameter.first ? parseInt(parameter.first) : 0
  const rows: number = parameter.rows ? parseInt(parameter.rows) : 20
  const sortField = parameter.sortField ? parameter.sortField : 'created_at'
  const sortOrder = parameter.sortOrder ? parseInt(parameter.sortOrder) : 1
  const filters = parameter.filters
  const query = []
  const sort_set = {}

  const filter_builder = { $and: [] }
  const filterSet = filters
  for (const a in filterSet) {
    if (
      a &&
      a !== '' &&
      filterSet[a].value !== '' &&
      filterSet[a].value !== null
    ) {
      const autoColumn = {}
      if (autoColumn[a] === undefined) {
        autoColumn[a] = {}
      }

      if (filterSet[a].matchMode === 'contains') {
        autoColumn[a] = {
          $regex: new RegExp(`${filterSet[a].value}`, 'i'),
        }
      } else if (filterSet[a].matchMode === 'notContains') {
        autoColumn[a] = {
          $not: {
            $regex: new RegExp(`${filterSet[a].value}`, 'i'),
          },
        }
      } else if (filterSet[a].matchMode === 'endsWith') {
        autoColumn[a] = {
          $regex: new RegExp(`${filterSet[a].value}$`, 'i'),
        }
      } else if (filterSet[a].matchMode === 'equals') {
        autoColumn[a] = {
          $eq: filterSet[a].value,
        }
      } else if (filterSet[a].matchMode === 'notEquals') {
        autoColumn[a] = {
          $not: {
            $eq: filterSet[a].value,
          },
        }
      }

      filter_builder.$and.push(autoColumn)
    }
  }

  if (filter_builder.$and.length > 0) {
    query.push({
      $match: filter_builder,
    })
  } else {
    query.push({
      $match: {
        $and: [{ deleted_at: null }],
      },
    })
  }
  //---------------------------------------------------------------------------

  const allNoFilter = await model
    .aggregate([
      ...query,
      {
        $count: 'total',
      },
    ])
    .exec()

  query.push({ $skip: first })

  query.push({ $limit: rows })

  if (sortField && sortOrder) {
    if (sort_set[sortField] === undefined) {
      sort_set[sortField] = sortOrder
    }

    query.push({
      $sort: sort_set,
    })
  }

  query.push({
    $group: {
      _id: null,
      data: { $push: '$$ROOT' },
    },
  })

  query.push({
    $unwind: {
      path: '$data',
      includeArrayIndex: 'index',
    },
  })

  query.push({
    $replaceRoot: {
      newRoot: {
        $mergeObjects: ['$data', { autonum: { $add: ['$index', first + 1] } }],
      },
    },
  })

  const data = await model.aggregate(query).exec()
  if (allNoFilter && allNoFilter.length > 0) {
    return {
      message: HttpStatus.OK,
      payload: {
        totalRecords: allNoFilter[0].total ? allNoFilter[0].total : 0,
        data: data,
      },
    }
  } else {
    return {
      message: HttpStatus.NO_CONTENT,
      payload: {
        totalRecords: 0,
        data: [],
      },
    }
  }
}
